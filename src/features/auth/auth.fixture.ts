import { test as base, expect, Page } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

type AuthFixtures = {
  adminPage: Page;
  employeePage: Page;
};

type Auth = {
  email: string;
  password: string;
  firstName: string;
};

const Admin: Auth = {
  email: process.env.E2E_ADMIN_EMAIL || '',
  password: process.env.E2E_ADMIN_PASSWORD || '',
  firstName: process.env.E2E_ADMIN_FIRST_NAME || '',
};

const Employee: Auth = {
  email: process.env.E2E_EMPLOYEE_EMAIL || '',
  password: process.env.E2E_EMPLOYEE_PASSWORD || '',
  firstName: process.env.E2E_EMPLOYEE_FIRST_NAME || '',
};

export const adminFirstName = Admin.firstName;
export const employeeFirstName = Employee.firstName;

const validateAuth = (auth: Auth, role: string) => {
  if (!auth.email || !auth.password) {
    throw new Error(`Missing ${role} credentials in environment variables`);
  }
};

const authenticate = async (page: Page, auth: Auth) => {
  await page.goto('/sign-in');
  await page.getByPlaceholder(/email/i).fill(auth.email);
  await page.getByPlaceholder(/password/i).fill(auth.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('**/users');
};

export const test = base.extend<AuthFixtures>({
  adminPage: async ({ page }, provide) => {
    validateAuth(Admin, 'Admin');
    await authenticate(page, Admin);
    await provide(page);
  },

  employeePage: async ({ page }, provide) => {
    validateAuth(Employee, 'Employee');
    await authenticate(page, Employee);
    await provide(page);
  },
});

export { expect };
