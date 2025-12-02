import { prisma } from './prisma-client';

interface AuditLogData {
  entityType: string;
  entityId: string;
  action: string;
  userId?: string;
  userName?: string;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry (for HMRC compliance)
 */
export async function createAuditLog(data: AuditLogData) {
  try {
    await prisma.auditLog.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        userId: data.userId,
        userName: data.userName,
        changes: data.changes ? JSON.stringify(data.changes) : null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    console.error('Error creating audit log:', error);
  }
}

/**
 * Get audit logs for an entity
 */
export async function getAuditLogs(entityType: string, entityId: string) {
  try {
    return await prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
}

