export class ApiResponse<T = unknown> {
  public success: true;
  public statusCode: number;
  public message: string;
  public data: T;
  public meta?: Record<string, unknown>;

  constructor(statusCode: number, message: string, data: T, meta?: Record<string, unknown>) {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }
}
