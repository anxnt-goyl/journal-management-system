export const healthCheck = (_req: any, res: any) => {
  res.status(200).json({
    status: 'ok',
    service: 'journal-management-system-api',
    timestamp: new Date().toISOString(),
  });
};
