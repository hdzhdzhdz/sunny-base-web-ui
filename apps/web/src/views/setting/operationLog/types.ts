export interface OperationLogVO {
  id: string;
  username: string;
  module: string;
  operationType: string;
  description: string;
  ip: string;
  status: 'success' | 'failure';
  createTime: string;
  duration: number;
}
