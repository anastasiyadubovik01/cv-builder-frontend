import { test, expect } from '@/features/auth/auth.fixture';

test.describe('User management', () => {
  test('Profile viewing: admin can log in, open user page, and verify fields', async ({
    adminPage,
  }) => {
    await adminPage.goto('/users');
    const firstRow = adminPage.locator('table tbody tr').first();

    const firstName = (await firstRow.locator('td').nth(1).textContent()) ?? '';
    const lastName = (await firstRow.locator('td').nth(2).textContent()) ?? '';
    const department =
      (await firstRow.locator('td').nth(4).textContent()) ?? '';
    const position = (await firstRow.locator('td').nth(5).textContent()) ?? '';
    const fullName = `${firstName} ${lastName}`.trim();

    const actionsButton = firstRow.locator('button[aria-label^="Actions for"]');
    await actionsButton.click();

    const viewButton = adminPage.locator('[role="menuitem"]:has-text("View")');
    await viewButton.click();

    await adminPage.waitForURL(/\/users\/[\w-]+/);

    await expect(
      adminPage.getByRole('heading', { name: fullName }),
    ).toBeVisible();

    await expect(
      adminPage.getByRole('textbox', { name: 'First Name' }),
    ).toHaveValue(firstName);
    await expect(
      adminPage.getByRole('textbox', { name: 'Last Name' }),
    ).toHaveValue(lastName);
    await expect(
      adminPage.getByRole('combobox', { name: 'Department' }),
    ).toContainText(department);
    await expect(
      adminPage.getByRole('combobox', { name: 'Position' }),
    ).toContainText(position);

    await expect(
      adminPage.getByRole('button', { name: 'Update' }),
    ).toBeDisabled();
  });
});
