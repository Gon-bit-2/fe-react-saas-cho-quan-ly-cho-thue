import { expect, request as playwrightRequest, test, type APIRequestContext } from '@playwright/test'
import { ApiClient, expectStatus, json, rows } from './support/api-client'
import { getPreparedApiSessions } from './support/global-setup'
import { createRunId, getApiEnvironment } from './support/environment'
import { publicRunContext, type RunContext } from './support/run-context'

const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10)
}

function addDays(days: number) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  return dateOnly(date)
}

function monthStart(offset: number) {
  const now = new Date()
  return dateOnly(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1)))
}

test.describe.serial('@flows complete rental lifecycle through real APIs', () => {
  const context: RunContext = { runId: createRunId(), cleanup: [] }
  const state: Record<string, number> = {}
  let requestContext: APIRequestContext
  let admin: ApiClient
  let landlord: ApiClient
  let tenant: ApiClient

  test.beforeAll(async () => {
    const environment = getApiEnvironment()
    requestContext = await playwrightRequest.newContext({
      baseURL: environment.baseUrl,
      extraHTTPHeaders: { accept: 'application/json' },
    })
    const { admin: adminSession, landlord: landlordSession, tenant: tenantSession } = getPreparedApiSessions()
    const membership = landlordSession.profile.tenantMembers.find(
      (item: Record<string, unknown>) => item.roleId === 'LANDLORD' && item.status === 'ACTIVE',
    )
    if (!membership) throw new Error('Landlord has no active LANDLORD tenant membership')
    if (!tenantSession.profile.renterProfile) throw new Error('Tenant account has no renter profile')

    context.tenantId = Number(membership.tenantId)
    context.landlordId = Number(landlordSession.profile.id)
    context.renterId = Number(tenantSession.profile.id)
    admin = new ApiClient(requestContext, adminSession.accessToken)
    landlord = new ApiClient(requestContext, landlordSession.accessToken, context.tenantId)
    tenant = new ApiClient(requestContext, tenantSession.accessToken)
  })

  // Playwright requires fixture arguments to use object destructuring.
  // eslint-disable-next-line no-empty-pattern
  test.afterAll(async ({}, testInfo) => {
    const cleanupPatch = async (
      type: string,
      id: number | undefined,
      path: string,
      data: unknown,
      disposition: 'closed' | 'inactive',
    ) => {
      if (!id || !landlord) return
      const response = await landlord.patch(path, { data })
      context.cleanup.push({
        type,
        id,
        disposition: response.ok() ? disposition : 'cleanup-failed',
        detail: response.ok() ? undefined : `HTTP ${response.status()}`,
      })
    }
    const cleanupDelete = async (type: string, id: number | undefined, client: ApiClient, path: string) => {
      if (!id || !client) return
      const response = await client.delete(path)
      context.cleanup.push({
        type,
        id,
        disposition: response.ok() ? 'deleted' : 'cleanup-failed',
        detail: response.ok() ? undefined : `HTTP ${response.status()}`,
      })
    }

    if (landlord) {
      await cleanupPatch(
        'service-assignment',
        context.serviceAssignmentId,
        `/service-assignments/${context.serviceAssignmentId}`,
        { isActive: false },
        'inactive',
      )
      await cleanupPatch(
        'service-item',
        context.serviceItemId,
        `/service-catalog/${context.serviceItemId}`,
        { isActive: false },
        'inactive',
      )
      await cleanupPatch(
        'utility-meter',
        context.meterId,
        `/utility-meters/${context.meterId}/status`,
        { status: 'INACTIVE' },
        'inactive',
      )
      await cleanupDelete(
        'room-image',
        state.mainImageId,
        landlord,
        `/rooms/${context.roomId}/images/${state.mainImageId}`,
      )
      await cleanupDelete(
        'secondary-room-image',
        state.secondaryImageId,
        landlord,
        `/rooms/${state.secondaryRoomId}/images/${state.secondaryImageId}`,
      )
      await cleanupDelete('room-asset', context.roomAssetId, landlord, `/room-assets/${context.roomAssetId}`)
      await cleanupDelete(
        'asset-category',
        context.assetCategoryId,
        landlord,
        `/asset-categories/${context.assetCategoryId}`,
      )
      await cleanupDelete('secondary-room', state.secondaryRoomId, landlord, `/rooms/${state.secondaryRoomId}`)
      await cleanupDelete('room', context.roomId, landlord, `/rooms/${context.roomId}`)
      await cleanupDelete('property', context.propertyId, landlord, `/properties/${context.propertyId}`)
    }
    if (admin && context.amenityId) {
      const response = await admin.patch(`/amenities/${context.amenityId}`, { data: { isActive: false } })
      context.cleanup.push({
        type: 'amenity',
        id: context.amenityId,
        disposition: response.ok() ? 'inactive' : 'cleanup-failed',
        detail: response.ok() ? undefined : `HTTP ${response.status()}`,
      })
    }
    for (const [type, id] of [
      ['contract', context.contractId],
      ['invoice', context.invoiceId],
      ['overdue-invoice', context.overdueInvoiceId],
      ['canceled-invoice', context.canceledInvoiceId],
      ['ticket', context.ticketId],
      ['review', context.reviewId],
      ['report', context.reportId],
      ['handover', context.handoverId],
      ['checkout-handover', context.checkoutHandoverId],
    ] as Array<[string, number | undefined]>) {
      if (id)
        context.cleanup.push({ type, id, disposition: 'retained', detail: `${context.runId} terminal audit record` })
    }
    await testInfo.attach('api-e2e-core-run-context.json', {
      body: Buffer.from(JSON.stringify(publicRunContext(context), null, 2)),
      contentType: 'application/json',
    })
    await requestContext?.dispose()
  })

  test('landlord creates property, floors, rooms and room assets', async () => {
    const amenityResponse = await admin.post('/amenities', {
      data: { name: `${context.runId} amenity`, category: 'E2E', isActive: true },
      expected: 201,
    })
    context.amenityId = Number((await json(amenityResponse)).id)

    const propertyResponse = await landlord.post('/properties', {
      data: {
        name: `${context.runId} property`,
        type: 'MINI_APARTMENT',
        province: 'Ho Chi Minh City',
        district: 'District 1',
        ward: 'Ben Nghe',
        addressDetail: `${context.runId} disposable address`,
        description: 'Created by real API workflow test',
        status: 'ACTIVE',
      },
      expected: 201,
    })
    context.propertyId = Number((await json(propertyResponse)).id)
    await landlord.get(`/properties/${context.propertyId}`, { expected: 200 })
    await landlord.patch(`/properties/${context.propertyId}`, {
      data: { description: `${context.runId} updated property` },
      expected: 200,
    })

    const floorResponse = await landlord.post(`/properties/${context.propertyId}/floors`, {
      data: { name: `${context.runId} floor`, floorNumber: 1 },
      expected: 201,
    })
    context.floorId = Number((await json(floorResponse)).id)

    const roomPayload = (suffix: string) => ({
      propertyId: context.propertyId,
      floorId: context.floorId,
      roomCode: `${context.runId}-${suffix}`.slice(-50),
      title: `${context.runId} room ${suffix}`,
      area: 28,
      maxOccupants: 2,
      basePrice: 4_500_000,
      depositAmount: 4_500_000,
      electricityPrice: 3_500,
      waterPrice: 20_000,
      description: 'Disposable API E2E room',
      status: 'AVAILABLE',
      amenityIds: [context.amenityId],
    })
    const roomResponse = await landlord.post('/rooms', { data: roomPayload('MAIN'), expected: 201 })
    context.roomId = Number((await json(roomResponse)).id)
    const secondaryResponse = await landlord.post('/rooms', { data: roomPayload('REJECT'), expected: 201 })
    state.secondaryRoomId = Number((await json(secondaryResponse)).id)

    for (const [label, roomId] of [
      ['mainImageId', context.roomId],
      ['secondaryImageId', state.secondaryRoomId],
    ] as const) {
      const uploadedRoom = await json(
        await landlord.post(`/rooms/${roomId}/images`, {
          multipart: {
            files: { name: `${context.runId}-${label}.png`, mimeType: 'image/png', buffer: TINY_PNG },
          },
          expected: 201,
        }),
      )
      expect(Array.isArray(uploadedRoom.images)).toBe(true)
      expect(uploadedRoom.images.length).toBeGreaterThan(0)
      state[label] = Number(uploadedRoom.images.at(-1).id)
    }

    await landlord.patch(`/rooms/${context.roomId}`, {
      data: { title: `${context.runId} room updated` },
      expected: 200,
    })
    await landlord.patch(`/rooms/${context.roomId}/amenities`, {
      data: { amenityIds: [context.amenityId] },
      expected: 200,
    })
    await landlord.get(`/rooms/${context.roomId}`, { expected: 200 })
    await landlord.get('/rooms', { params: { propertyId: context.propertyId }, expected: 200 })
    await landlord.get('/properties/2147483647', { expected: 404 })

    const categoryResponse = await landlord.post('/asset-categories', {
      data: { name: `${context.runId} furniture`, description: 'Disposable category' },
      expected: 201,
    })
    context.assetCategoryId = Number((await json(categoryResponse)).id)
    const assetResponse = await landlord.post(`/rooms/${context.roomId}/assets`, {
      data: { categoryId: context.assetCategoryId, name: `${context.runId} desk`, quantity: 1, condition: 'GOOD' },
      expected: 201,
    })
    context.roomAssetId = Number((await json(assetResponse)).id)
    await landlord.patch(`/room-assets/${context.roomAssetId}`, {
      data: { condition: 'NORMAL', quantity: 1 },
      expected: 200,
    })
    await landlord.get(`/room-assets/${context.roomAssetId}`, { expected: 200 })
    await landlord.get(`/rooms/${context.roomId}/assets`, { expected: 200 })
  })

  test('landlord submits rooms and admin publishes them to the real marketplace', async () => {
    for (const roomId of [context.roomId, state.secondaryRoomId]) {
      await landlord.patch(`/rooms/${roomId}/marketplace`, {
        data: { marketplaceStatus: 'PENDING_REVIEW' },
        expected: 200,
      })
      await admin.patch(`/marketplace/admin/rooms/${roomId}/status`, {
        data: { marketplaceStatus: 'PUBLISHED' },
        expected: 200,
      })
      await admin.get(`/marketplace/admin/rooms/${roomId}`, { expected: 200 })
      await admin.get(`/marketplace/admin/rooms/${roomId}/history`, { expected: 200 })
      await requestContext
        .get(`/marketplace/rooms/${roomId}`)
        .then((response) => expectStatus(response, 200, 'Public marketplace detail'))
    }
    const moderation = rows(
      await json(
        await admin.get('/marketplace/admin/rooms', { params: { tenantId: context.tenantId }, expected: 200 }),
      ),
    )
    expect(moderation.some((item) => Number(item.id) === context.roomId)).toBe(true)
  })

  test('tenant schedules/cancels viewing appointments and landlord updates the main appointment', async () => {
    const canceledResponse = await tenant.post(`/marketplace/rooms/${context.roomId}/viewing-appointments`, {
      data: { scheduledAt: addDays(8), note: `${context.runId} cancel appointment` },
      expected: 201,
    })
    state.canceledAppointmentId = Number((await json(canceledResponse)).id)
    await tenant.patch(`/room-viewing-appointments/me/${state.canceledAppointmentId}/cancel`, {
      data: {},
      expected: 200,
    })

    const appointmentResponse = await tenant.post(`/marketplace/rooms/${context.roomId}/viewing-appointments`, {
      data: { scheduledAt: addDays(10), note: `${context.runId} main appointment` },
      expected: 201,
    })
    context.appointmentId = Number((await json(appointmentResponse)).id)
    await tenant.get('/room-viewing-appointments/me', { expected: 200 })
    await landlord.get('/room-viewing-appointments', { params: { roomId: context.roomId }, expected: 200 })
    const confirmed = await landlord.patch(`/room-viewing-appointments/${context.appointmentId}/status`, {
      data: { status: 'CONFIRMED', landlordNote: `${context.runId} confirmed` },
      expected: 200,
    })
    expect((await json(confirmed)).status).toBe('CONFIRMED')
  })

  test('tenant submits/cancels rental requests and landlord approves or rejects', async () => {
    const canceledResponse = await tenant.post(`/marketplace/rooms/${context.roomId}/rental-requests`, {
      data: {
        expectedStartDate: addDays(20),
        appointmentId: context.appointmentId,
        message: `${context.runId} cancel request`,
      },
      expected: 201,
    })
    state.canceledRentalRequestId = Number((await json(canceledResponse)).id)
    await tenant.patch(`/rental-requests/me/${state.canceledRentalRequestId}/cancel`, { data: {}, expected: 200 })

    const mainResponse = await tenant.post(`/marketplace/rooms/${context.roomId}/rental-requests`, {
      data: {
        expectedStartDate: addDays(20),
        appointmentId: context.appointmentId,
        message: `${context.runId} main request`,
      },
      expected: 201,
    })
    context.rentalRequestId = Number((await json(mainResponse)).id)
    await tenant.post(`/marketplace/rooms/${context.roomId}/rental-requests`, {
      data: { expectedStartDate: addDays(21), message: `${context.runId} duplicate` },
      expected: 409,
    })
    await tenant.get('/rental-requests/me', { expected: 200 })
    const approved = await landlord.patch(`/rental-requests/${context.rentalRequestId}/decision`, {
      data: { status: 'APPROVED' },
      expected: 200,
    })
    expect((await json(approved)).status).toBe('APPROVED')

    const rejectedResponse = await tenant.post(`/marketplace/rooms/${state.secondaryRoomId}/rental-requests`, {
      data: { expectedStartDate: addDays(25), message: `${context.runId} reject request` },
      expected: 201,
    })
    state.rejectedRentalRequestId = Number((await json(rejectedResponse)).id)
    const rejected = await landlord.patch(`/rental-requests/${state.rejectedRentalRequestId}/decision`, {
      data: { status: 'REJECTED' },
      expected: 200,
    })
    expect((await json(rejected)).status).toBe('REJECTED')
    await landlord.get('/rental-requests', { params: { roomId: context.roomId }, expected: 200 })
  })

  test('landlord creates and activates the contract; tenant sees only their contract', async () => {
    const startDate = new Date()
    startDate.setUTCMonth(startDate.getUTCMonth() - 3)
    const endDate = new Date()
    endDate.setUTCFullYear(endDate.getUTCFullYear() + 1)
    state.contractStartEpoch = startDate.getTime()

    const payload = {
      roomId: context.roomId,
      renterId: context.renterId,
      rentalRequestId: context.rentalRequestId,
      contractCode: `${context.runId}-CONTRACT`,
      startDate: dateOnly(startDate),
      endDate: dateOnly(endDate),
      monthlyPrice: 4_500_000,
      depositAmount: 4_500_000,
      billingCycle: 'MONTHLY',
      paymentDueDay: 10,
      contentSnapshot: `${context.runId} disposable contract content`,
      coRenterIds: [],
    }
    const response = await landlord.post('/contracts', { data: payload, expected: 201 })
    context.contractId = Number((await json(response)).id)
    await landlord.patch(`/contracts/${context.contractId}`, {
      data: { contentSnapshot: `${context.runId} updated contract`, paymentDueDay: 12 },
      expected: 200,
    })
    const activated = await landlord.patch(`/contracts/${context.contractId}/activate`, { data: {}, expected: 200 })
    expect((await json(activated)).status).toBe('ACTIVE')
    await landlord.get(`/contracts/${context.contractId}`, { expected: 200 })
    const mine = await tenant.get(`/contracts/me/${context.contractId}`, { expected: 200 })
    expect(Number((await json(mine)).renterId)).toBe(context.renterId)
    await tenant.get('/contracts/me', { params: { roomId: context.roomId }, expected: 200 })

    await landlord.post('/contracts', {
      data: { ...payload, rentalRequestId: null, contractCode: `${context.runId}-DUPLICATE` },
      expected: 400,
    })
    await expectStatus(
      await tenant.get(`/contracts/${context.contractId}`),
      [400, 403],
      'Tenant cannot access landlord contract route',
    )
  })

  test('landlord creates service assignments and confirmed utility readings', async () => {
    const itemResponse = await landlord.post('/service-catalog', {
      data: {
        code: context.runId.slice(-40),
        name: `${context.runId} internet`,
        description: 'Disposable service',
        itemType: 'INTERNET',
        defaultUnitPrice: 120000,
        unitLabel: 'month',
        isActive: true,
      },
      expected: 201,
    })
    context.serviceItemId = Number((await json(itemResponse)).id)
    await landlord.patch(`/service-catalog/${context.serviceItemId}`, {
      data: { defaultUnitPrice: 125000 },
      expected: 200,
    })

    const assignmentResponse = await landlord.post('/service-assignments', {
      data: {
        serviceItemId: context.serviceItemId,
        contractId: context.contractId,
        quantity: 1,
        unitPrice: 125000,
        startsAt: monthStart(-2),
        isActive: true,
      },
      expected: 201,
    })
    context.serviceAssignmentId = Number((await json(assignmentResponse)).id)
    await landlord.patch(`/service-assignments/${context.serviceAssignmentId}`, {
      data: { quantity: 1.25 },
      expected: 200,
    })
    await landlord.post('/service-assignments', {
      data: {
        serviceItemId: context.serviceItemId,
        roomId: context.roomId,
        contractId: context.contractId,
        quantity: 1,
      },
      expected: 400,
    })
    await landlord.get('/service-assignments', { params: { contractId: context.contractId }, expected: 200 })

    const meterResponse = await landlord.post('/utility-meters', {
      data: {
        roomId: context.roomId,
        type: 'ELECTRICITY',
        meterCode: `${context.runId}-ELEC`,
        unit: 'kWh',
        status: 'ACTIVE',
      },
      expected: 201,
    })
    context.meterId = Number((await json(meterResponse)).id)
    await landlord.patch(`/utility-meters/${context.meterId}`, { data: { unit: 'kWh' }, expected: 200 })

    const readingResponse = await landlord.post('/meter-readings', {
      data: {
        meterId: context.meterId,
        billingMonth: monthStart(0),
        previousValue: 10,
        currentValue: 25,
        unitPrice: 3500,
        status: 'CONFIRMED',
      },
      expected: 201,
    })
    context.readingId = Number((await json(readingResponse)).id)
    await landlord.get(`/meter-readings/${context.readingId}`, { expected: 200 })
    await landlord.get('/meter-readings', { params: { meterId: context.meterId }, expected: 200 })
  })

  test('check-in handover covers dispute, resolution and both signatures', async () => {
    const response = await landlord.post('/handovers', {
      data: {
        contractId: context.contractId,
        type: 'CHECKIN',
        note: `${context.runId} checkin`,
        items: [{ roomAssetId: context.roomAssetId, actualQuantity: 1, condition: 'NORMAL', note: 'Accepted' }],
      },
      expected: 201,
    })
    let handover = await json(response)
    context.handoverId = Number(handover.id)
    await tenant.get(`/handovers/me/${context.handoverId}`, { expected: 200 })

    const disputed = await tenant.patch(`/handovers/me/${context.handoverId}/dispute`, {
      data: { version: handover.version, reason: `${context.runId} verify dispute path` },
      expected: 200,
    })
    handover = await json(disputed)
    expect(handover.status).toBe('DISPUTED')

    const resolved = await landlord.patch(`/handovers/${context.handoverId}/resolve`, {
      data: { version: handover.version, resolutionNote: `${context.runId} resolved` },
      expected: 200,
    })
    handover = await json(resolved)
    expect(handover.status).toBe('DRAFT')

    handover = await json(
      await landlord.patch(`/handovers/${context.handoverId}/confirm`, {
        data: { version: handover.version },
        expected: 200,
      }),
    )
    handover = await json(
      await tenant.patch(`/handovers/me/${context.handoverId}/confirm`, {
        data: { version: handover.version },
        expected: 200,
      }),
    )
    expect(handover.status).toBe('CONFIRMED')
    await tenant.patch(`/handovers/me/${context.handoverId}/confirm`, {
      data: { version: handover.version },
      expected: 400,
    })
  })
  test('invoices cover draft, issue, overdue, cancel and manual payment review', async () => {
    const mainResponse = await landlord.post('/invoices', {
      data: {
        contractId: context.contractId,
        billingMonth: monthStart(0),
        issueDate: addDays(0),
        dueDate: addDays(10),
        note: `${context.runId} main invoice`,
        status: 'DRAFT',
        extraItems: [{ itemType: 'OTHER', description: `${context.runId} extra`, quantity: 1, unitPrice: 50000 }],
      },
      expected: 201,
    })
    context.invoiceId = Number((await json(mainResponse)).id)
    await landlord.patch(`/invoices/${context.invoiceId}`, {
      data: {
        note: `${context.runId} invoice updated`,
        extraItems: [
          { itemType: 'OTHER', description: `${context.runId} updated extra`, quantity: 1, unitPrice: 50000 },
        ],
      },
      expected: 200,
    })
    await landlord.patch(`/invoices/${context.invoiceId}/issue`, { data: {}, expected: 200 })
    const renterInvoice = await json(await tenant.get(`/invoices/me/${context.invoiceId}`, { expected: 200 }))
    const amount = Number(renterInvoice.debtAmount)
    expect(amount).toBeGreaterThan(0)
    await tenant.get('/invoices/me', { params: { contractId: context.contractId }, expected: 200 })
    await tenant.get('/invoices/debts/me', { params: { contractId: context.contractId }, expected: 200 })
    await landlord.get('/invoices/debts', { params: { contractId: context.contractId }, expected: 200 })
    await landlord.patch(`/invoices/${context.invoiceId}`, { data: { note: 'forbidden after issue' }, expected: 400 })

    await tenant.post(`/invoices/me/${context.invoiceId}/payment-confirmations`, {
      data: { amount: amount + 1, transactionCode: `${context.runId}-OVERPAY` },
      expected: 400,
    })
    const paymentResponse = await tenant.post(`/invoices/me/${context.invoiceId}/payment-confirmations`, {
      data: {
        amount,
        transactionCode: `${context.runId}-PAID`,
        renterNote: `${context.runId} manual payment`,
        paidAt: addDays(0),
      },
      expected: 201,
    })
    context.paymentId = Number((await json(paymentResponse)).id)
    await tenant.get(`/payments/me/${context.paymentId}`, { expected: 200 })
    await landlord.get(`/payments/${context.paymentId}`, { expected: 200 })
    const approved = await landlord.patch(`/payments/${context.paymentId}/approve`, {
      data: { landlordNote: `${context.runId} approved` },
      expected: 200,
    })
    expect((await json(approved)).status).toBe('SUCCESS')
    await landlord.patch(`/payments/${context.paymentId}/approve`, {
      data: { landlordNote: 'duplicate approval' },
      expected: [400, 409],
    })
    const paidInvoice = await json(await tenant.get(`/invoices/me/${context.invoiceId}`, { expected: 200 }))
    expect(paidInvoice.status).toBe('PAID')
    expect(Number(paidInvoice.debtAmount)).toBe(0)

    const overdueResponse = await landlord.post('/invoices', {
      data: {
        contractId: context.contractId,
        billingMonth: monthStart(-1),
        issueDate: monthStart(-1),
        dueDate: addDays(-2),
        note: `${context.runId} overdue invoice`,
        status: 'DRAFT',
        extraItems: [],
      },
      expected: 201,
    })
    context.overdueInvoiceId = Number((await json(overdueResponse)).id)
    await landlord.patch(`/invoices/${context.overdueInvoiceId}/issue`, { data: {}, expected: 200 })
    await landlord.patch(`/invoices/${context.overdueInvoiceId}/overdue`, { data: {}, expected: 200 })
    const rejectedPayment = await tenant.post(`/invoices/me/${context.overdueInvoiceId}/payment-confirmations`, {
      data: { amount: 1000, transactionCode: `${context.runId}-REJECT`, renterNote: 'Reject branch' },
      expected: 201,
    })
    context.rejectedPaymentId = Number((await json(rejectedPayment)).id)
    const rejected = await landlord.patch(`/payments/${context.rejectedPaymentId}/reject`, {
      data: { landlordNote: `${context.runId} evidence invalid` },
      expected: 200,
    })
    expect((await json(rejected)).status).toBe('FAILED')

    const canceledResponse = await landlord.post('/invoices', {
      data: {
        contractId: context.contractId,
        billingMonth: monthStart(-2),
        issueDate: monthStart(-2),
        dueDate: monthStart(-1),
        note: `${context.runId} cancel invoice`,
        status: 'DRAFT',
        extraItems: [],
      },
      expected: 201,
    })
    context.canceledInvoiceId = Number((await json(canceledResponse)).id)
    const canceled = await landlord.patch(`/invoices/${context.canceledInvoiceId}/cancel`, { data: {}, expected: 200 })
    expect((await json(canceled)).status).toBe('CANCELED')
    await tenant.get('/payments/me', { expected: 200 })
    await landlord.get('/payments', { params: { invoiceId: context.invoiceId }, expected: 200 })
  })

  test('ticket workflow covers comments, assignment, reopen, resolve, close and cancel', async () => {
    const response = await tenant.post('/tickets', {
      data: {
        roomId: context.roomId,
        contractId: context.contractId,
        title: `${context.runId} support ticket`,
        description: 'Disposable ticket created through real API',
        category: 'WATER',
        priority: 'HIGH',
        attachments: [],
      },
      expected: 201,
    })
    context.ticketId = Number((await json(response)).id)
    await tenant.post(`/tickets/${context.ticketId}/comments`, {
      data: { message: `${context.runId} renter comment`, isInternal: false },
      expected: 201,
    })
    const assigned = await landlord.patch(`/tickets/${context.ticketId}/assign`, {
      data: { assignedTo: context.landlordId },
      expected: 200,
    })
    expect((await json(assigned)).status).toBe('IN_PROGRESS')
    await landlord.post(`/tickets/${context.ticketId}/comments`, {
      data: { message: `${context.runId} landlord internal comment`, isInternal: true },
      expected: 201,
    })
    await landlord.patch(`/tickets/${context.ticketId}/status`, { data: { status: 'WAITING_RENTER' }, expected: 200 })
    await landlord.patch(`/tickets/${context.ticketId}/status`, { data: { status: 'RESOLVED' }, expected: 200 })
    const reopened = await tenant.patch(`/tickets/me/${context.ticketId}/reopen`, { data: {}, expected: 200 })
    expect((await json(reopened)).status).toBe('IN_PROGRESS')
    await landlord.patch(`/tickets/${context.ticketId}/status`, { data: { status: 'RESOLVED' }, expected: 200 })
    const closed = await tenant.patch(`/tickets/me/${context.ticketId}/close`, { data: {}, expected: 200 })
    expect((await json(closed)).status).toBe('CLOSED')

    await tenant.get(`/tickets/me/${context.ticketId}/comments`, { expected: 200 })
    const history = rows(await json(await tenant.get(`/tickets/me/${context.ticketId}/history`, { expected: 200 })))
    expect(history.map((item) => item.action)).toEqual(
      expect.arrayContaining(['ASSIGN_TICKET', 'RENTER_REOPEN_TICKET', 'RENTER_CLOSE_TICKET']),
    )

    const canceledResponse = await tenant.post('/tickets', {
      data: {
        roomId: context.roomId,
        contractId: context.contractId,
        title: `${context.runId} canceled ticket`,
        description: 'Cancellation branch',
        category: 'OTHER',
        priority: 'LOW',
        attachments: [],
      },
      expected: 201,
    })
    context.canceledTicketId = Number((await json(canceledResponse)).id)
    const canceled = await tenant.patch(`/tickets/me/${context.canceledTicketId}/cancel`, { data: {}, expected: 200 })
    expect((await json(canceled)).status).toBe('CANCELED')
  })

  test('optional storage upload is explicit and never silently mocked', async () => {
    const environment = getApiEnvironment()
    test.skip(!environment.enableUploads, 'E2E_ENABLE_UPLOADS is false; external dev storage was not authorized')
    expect(context.ticketId).toBeTruthy()
    await tenant.post(`/tickets/${context.ticketId}/attachments/upload`, {
      multipart: { file: { name: 'api-e2e.txt', mimeType: 'text/plain', buffer: Buffer.from(context.runId) } },
      expected: 201,
    })
    await tenant.get(`/tickets/me/${context.ticketId}/attachments`, { expected: 200 })
  })

  test('tenant review/report are moderated by admin and become publicly visible', async () => {
    const reviewResponse = await tenant.post('/reviews', {
      data: {
        contractId: context.contractId,
        rating: 5,
        content: `${context.runId} verified rental review`,
        cleanlinessScore: 5,
        locationScore: 4,
        priceScore: 4,
        serviceScore: 5,
      },
      expected: 201,
    })
    context.reviewId = Number((await json(reviewResponse)).id)
    await tenant.get(`/reviews/me/${context.reviewId}`, { expected: 200 })
    await admin.get(`/reviews/admin/${context.reviewId}`, { expected: 200 })
    await admin.patch(`/reviews/admin/${context.reviewId}/status`, { data: { status: 'APPROVED' }, expected: 200 })
    await expectStatus(
      await requestContext.get(`/marketplace/rooms/${context.roomId}/reviews`),
      404,
      'Occupied room reviews stay outside the public marketplace',
    )

    const reportResponse = await tenant.post('/reports', {
      data: {
        targetType: 'TENANT',
        targetId: String(context.tenantId),
        reason: `${context.runId} report reason`,
        description: 'Disposable moderation report',
      },
      expected: 201,
    })
    context.reportId = Number((await json(reportResponse)).id)
    await tenant.get(`/reports/me/${context.reportId}`, { expected: 200 })
    await admin.get(`/reports/admin/${context.reportId}`, { expected: 200 })
    await admin.patch(`/reports/admin/${context.reportId}/status`, { data: { status: 'REVIEWING' }, expected: 200 })
    const resolved = await admin.patch(`/reports/admin/${context.reportId}/status`, {
      data: { status: 'RESOLVED', resolutionNote: `${context.runId} reviewed` },
      expected: 200,
    })
    expect((await json(resolved)).status).toBe('RESOLVED')
  })
  test('notifications created by workflow stay scoped to the signed-in user', async () => {
    const before = await json(await tenant.get('/notifications/unread-count', { expected: 200 }))
    expect(typeof before === 'number' || typeof before.count === 'number').toBe(true)
    const notifications = rows(
      await json(await tenant.get('/notifications', { params: { isRead: false }, expected: 200 })),
    )
    if (notifications.length > 0) {
      expect(notifications.every((item) => Number(item.userId) === context.renterId)).toBe(true)
      await tenant.patch(`/notifications/${notifications[0].id}/read`, { data: {}, expected: 200 })
    }
    await tenant.patch('/notifications/read-all', { data: {}, expected: 200 })
  })

  test('termination covers cancel, reject, approve, checkout handover and completion', async () => {
    const body = (suffix: string) => ({
      contractId: context.contractId,
      reason: `${context.runId} ${suffix}`,
      expectedMoveOutDate: addDays(7),
    })

    const canceledResponse = await tenant.post('/contract-terminations/me', { data: body('cancel'), expected: 201 })
    state.canceledTerminationId = Number((await json(canceledResponse)).id)
    await tenant.patch(`/contract-terminations/me/${state.canceledTerminationId}/cancel`, { data: {}, expected: 200 })

    const rejectedResponse = await tenant.post('/contract-terminations/me', { data: body('reject'), expected: 201 })
    state.rejectedTerminationId = Number((await json(rejectedResponse)).id)
    await landlord.patch(`/contract-terminations/${state.rejectedTerminationId}/reject`, {
      data: { reviewNote: `${context.runId} rejection branch` },
      expected: 200,
    })

    const approvedResponse = await tenant.post('/contract-terminations/me', { data: body('approve'), expected: 201 })
    context.terminationId = Number((await json(approvedResponse)).id)
    const approved = await landlord.patch(`/contract-terminations/${context.terminationId}/approve`, {
      data: { reviewNote: `${context.runId} approved termination` },
      expected: 200,
    })
    expect((await json(approved)).status).toBe('APPROVED')

    let checkout = await json(
      await landlord.post('/handovers', {
        data: {
          contractId: context.contractId,
          type: 'CHECKOUT',
          note: `${context.runId} checkout`,
          items: [{ roomAssetId: context.roomAssetId, actualQuantity: 1, condition: 'NORMAL', note: 'Returned' }],
        },
        expected: 201,
      }),
    )
    context.checkoutHandoverId = Number(checkout.id)
    checkout = await json(
      await landlord.patch(`/handovers/${context.checkoutHandoverId}/confirm`, {
        data: { version: checkout.version },
        expected: 200,
      }),
    )
    checkout = await json(
      await tenant.patch(`/handovers/me/${context.checkoutHandoverId}/confirm`, {
        data: { version: checkout.version },
        expected: 200,
      }),
    )
    expect(checkout.status).toBe('CONFIRMED')

    const completed = await landlord.patch(`/contract-terminations/${context.terminationId}/complete`, {
      data: {
        checkoutHandoverId: context.checkoutHandoverId,
        actualMoveOutDate: addDays(0),
        acknowledgeOutstandingDebt: true,
        completionNote: `${context.runId} outstanding rejected-payment invoice acknowledged`,
      },
      expected: 200,
    })
    expect((await json(completed)).status).toBe('COMPLETED')
    const contract = await json(await landlord.get(`/contracts/${context.contractId}`, { expected: 200 }))
    expect(contract.status).toBe('TERMINATED')
    const room = await json(await landlord.get(`/rooms/${context.roomId}`, { expected: 200 }))
    expect(room.status).toBe('AVAILABLE')
    expect(room.marketplaceStatus).toBe('HIDDEN')

    await landlord.patch(`/rooms/${context.roomId}/marketplace`, {
      data: { marketplaceStatus: 'PENDING_REVIEW' },
      expected: 200,
    })
    await admin.patch(`/marketplace/admin/rooms/${context.roomId}/status`, {
      data: { marketplaceStatus: 'PUBLISHED' },
      expected: 200,
    })

    const publicReviews = rows(await json(await requestContext.get(`/marketplace/rooms/${context.roomId}/reviews`)))
    expect(publicReviews.some((item) => Number(item.id) === context.reviewId)).toBe(true)
    await requestContext
      .get(`/marketplace/rooms/${context.roomId}/review-summary`)
      .then((response) => expectStatus(response, 200, 'Review summary after checkout'))
  })
})
