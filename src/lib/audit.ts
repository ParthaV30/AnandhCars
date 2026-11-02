/**
 * Audit logging utility for sensitive operations
 */

import { prisma } from '@/lib/db/prisma';
import { logger } from './logger';

interface AuditLogEntry {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an audit entry
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        oldData: entry.oldData ? JSON.stringify(entry.oldData) : null,
        newData: entry.newData ? JSON.stringify(entry.newData) : null,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      },
    });

    logger.info(`AUDIT: ${entry.action}`, {
      audit: true,
      action: entry.action,
      userId: entry.userId,
      entityType: entry.entityType,
      entityId: entry.entityId,
      metadata: entry.metadata,
    });
  } catch (error) {
    logger.error('Failed to write audit log', { error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

/**
 * Log document creation
 */
export async function logDocumentCreated(
  userId: string,
  documentId: string,
  documentType: string,
  documentNumber: string,
  customerId?: string,
  vehicleId?: string,
  amount?: number,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAudit({
    userId,
    action: 'DOCUMENT_CREATED',
    entityType: 'Document',
    entityId: documentId,
    newData: {
      documentType,
      documentNumber,
      customerId,
      vehicleId,
      amount,
    },
    ipAddress,
    userAgent,
    metadata: { documentType, documentNumber },
  });
}

/**
 * Log document update
 */
export async function logDocumentUpdated(
  userId: string,
  documentId: string,
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAudit({
    userId,
    action: 'DOCUMENT_UPDATED',
    entityType: 'Document',
    entityId: documentId,
    oldData,
    newData,
    ipAddress,
    userAgent,
  });
}

/**
 * Log document deletion
 */
export async function logDocumentDeleted(
  userId: string,
  documentId: string,
  documentType: string,
  documentNumber: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAudit({
    userId,
    action: 'DOCUMENT_DELETED',
    entityType: 'Document',
    entityId: documentId,
    oldData: {
      documentType,
      documentNumber,
    },
    ipAddress,
    userAgent,
  });
}

/**
 * Log payment recorded
 */
export async function logPaymentRecorded(
  userId: string,
  paymentId: string,
  documentId: string,
  amount: number,
  method: string,
  reference?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAudit({
    userId,
    action: 'PAYMENT_RECORDED',
    entityType: 'Payment',
    entityId: paymentId,
    newData: {
      documentId,
      amount,
      method,
      reference,
    },
    ipAddress,
    userAgent,
    metadata: { documentId, amount, method },
  });
}

/**
 * Log payment updated
 */
export async function logPaymentUpdated(
  userId: string,
  paymentId: string,
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAudit({
    userId,
    action: 'PAYMENT_UPDATED',
    entityType: 'Payment',
    entityId: paymentId,
    oldData,
    newData,
    ipAddress,
    userAgent,
  });
}

/**
 * Log customer created
 */
export async function logCustomerCreated(
  userId: string,
  customerId: string,
  customerName: string,
  gstin?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAudit({
    userId,
    action: 'CUSTOMER_CREATED',
    entityType: 'Customer',
    entityId: customerId,
    newData: {
      name: customerName,
      gstin,
    },
    ipAddress,
    userAgent,
    metadata: { customerName },
  });
}

/**
 * Log customer updated
 */
export async function logCustomerUpdated(
  userId: string,
  customerId: string,
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAudit({
    userId,
    action: 'CUSTOMER_UPDATED',
    entityType: 'Customer',
    entityId: customerId,
    oldData,
    newData,
    ipAddress,
    userAgent,
  });
}

/**
 * Log vehicle created
 */
export async function logVehicleCreated(
  userId: string,
  vehicleId: string,
  registrationNo: string,
  manufacturer: string,
  model: string,
  customerId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAudit({
    userId,
    action: 'VEHICLE_CREATED',
    entityType: 'Vehicle',
    entityId: vehicleId,
    newData: {
      registrationNo,
      manufacturer,
      model,
      customerId,
    },
    ipAddress,
    userAgent,
  });
}

/**
 * Log item created
 */
export async function logItemCreated(
  userId: string,
  itemId: string,
  description: string,
  category: string,
  price: number,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAudit({
    userId,
    action: 'ITEM_CREATED',
    entityType: 'PartsService',
    entityId: itemId,
    newData: {
      description,
      category,
      price,
    },
    ipAddress,
    userAgent,
  });
}

/**
 * Log user login
 */
export async function logUserLogin(
  userId: string,
  email: string,
  ipAddress?: string,
  userAgent?: string,
  success: boolean = true
): Promise<void> {
  await logAudit({
    userId,
    action: success ? 'USER_LOGIN' : 'USER_LOGIN_FAILED',
    entityType: 'User',
    entityId: userId,
    newData: { email },
    ipAddress,
    userAgent,
    metadata: { success },
  });
}

/**
 * Log user logout
 */
export async function logUserLogout(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAudit({
    userId,
    action: 'USER_LOGOUT',
    entityType: 'User',
    entityId: userId,
    ipAddress,
    userAgent,
  });
}

/**
 * Log settings changed
 */
export async function logSettingsChanged(
  userId: string,
  oldSettings: Record<string, unknown>,
  newSettings: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAudit({
    userId,
    action: 'SETTINGS_CHANGED',
    entityType: 'WorkshopSettings',
    entityId: 'singleton',
    oldData: oldSettings,
    newData: newSettings,
    ipAddress,
    userAgent,
  });
}

/**
 * Get audit logs for an entity
 */
export async function getAuditLogs(
  entityType: string,
  entityId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Array<{
  id: string;
  action: string;
  userId: string | null;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}>> {
  const logs = await prisma.auditLog.findMany({
    where: {
      entityType,
      entityId,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    select: {
      id: true,
      action: true,
      userId: true,
      oldData: true,
      newData: true,
      ipAddress: true,
      userAgent: true,
      createdAt: true,
    },
  });

  return logs.map(log => ({
    id: log.id,
    action: log.action,
    userId: log.userId,
    oldData: log.oldData ? JSON.parse(log.oldData as string) : null,
    newData: log.newData ? JSON.parse(log.newData as string) : null,
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
    createdAt: log.createdAt,
  }));
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Array<{
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}>> {
  const logs = await prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    select: {
      id: true,
      action: true,
      entityType: true,
      entityId: true,
      oldData: true,
      newData: true,
      ipAddress: true,
      userAgent: true,
      createdAt: true,
    },
  });

  return logs.map(log => ({
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    oldData: log.oldData ? JSON.parse(log.oldData as string) : null,
    newData: log.newData ? JSON.parse(log.newData as string) : null,
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
    createdAt: log.createdAt,
  }));
}