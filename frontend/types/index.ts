export type UserRole = 'ADMIN' | 'STAFF';

export interface User {
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface UserRef {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Product {
  _id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  lastUpdatedBy: UserRef;
  createdAt: string;
  updatedAt: string;
}

export interface CsvRowError {
  row: number;
  sku: string;
  reason: string;
}

export interface CsvUploadResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: CsvRowError[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
}
