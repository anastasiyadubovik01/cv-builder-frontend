import { test, expect } from '@/features/auth/auth.fixture';

test.describe('User management', () => {
  test('Profile viewing: admin can log in, open user page and verify fields', async ({
    adminPage,
  }) => {
    await adminPage.goto('/users');

    const searchInput = adminPage.getByPlaceholder(/search/i);
    await searchInput.fill('TestEmployee');
    await adminPage.waitForTimeout(500);

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

  test('Edit profile: admin updates test employee name, changes are reflected', async ({
    adminPage,
  }) => {
    await adminPage.goto('/users');

    const searchInput = adminPage.getByPlaceholder(/search/i);
    await searchInput.fill('TestEmployee');
    await adminPage.waitForTimeout(500);

    const firstRow = adminPage.locator('table tbody tr').first();
    const initialFirstName =
      (await firstRow.locator('td').nth(1).textContent()) ?? '';
    const initialLastName =
      (await firstRow.locator('td').nth(2).textContent()) ?? '';

    const actionsButton = firstRow.locator('button[aria-label^="Actions for"]');
    await actionsButton.click();
    const viewButton = adminPage.locator('[role="menuitem"]:has-text("View")');
    await viewButton.click();
    await adminPage.waitForURL(/\/users\/[\w-]+/);

    const firstNameInput = adminPage.getByRole('textbox', {
      name: 'First Name',
    });
    const newFirstName = `Updated_${initialFirstName}`;
    await firstNameInput.fill(newFirstName);

    const updateButton = adminPage.getByRole('button', { name: 'Update' });
    await expect(updateButton).toBeEnabled();
    await updateButton.click();

    await expect(updateButton).toBeDisabled({ timeout: 10000 });

    await expect(firstNameInput).toHaveValue(newFirstName);

    await expect(
      adminPage.getByRole('heading', {
        name: `${newFirstName} ${initialLastName}`,
      }),
    ).toBeVisible();

    await firstNameInput.fill(initialFirstName);
    await updateButton.click();
    await expect(updateButton).toBeDisabled({ timeout: 10000 });
    await expect(firstNameInput).toHaveValue(initialFirstName);
  });

  test('Edit profile: admin updates test employee position, changes are reflected', async ({
    adminPage,
  }) => {
    await adminPage.goto('/users');

    const searchInput = adminPage.getByPlaceholder(/search/i);
    await searchInput.fill('TestEmployee');
    await adminPage.waitForTimeout(500);

    const firstRow = adminPage.locator('table tbody tr').first();
    const initialPosition =
      (await firstRow.locator('td').nth(5).textContent()) ?? '';

    const actionsButton = firstRow.locator('button[aria-label^="Actions for"]');
    await actionsButton.click();
    const viewButton = adminPage.locator('[role="menuitem"]:has-text("View")');
    await viewButton.click();
    await adminPage.waitForURL(/\/users\/[\w-]+/);

    const positionSelect = adminPage.getByRole('combobox', {
      name: 'Position',
    });
    await positionSelect.click();

    const options = adminPage.locator('[role="option"]');
    const optionCount = await options.count();
    let newPosition = initialPosition;
    for (let i = 0; i < optionCount; i++) {
      const text = await options.nth(i).textContent();
      if (text && text.trim() !== initialPosition) {
        newPosition = text.trim();
        await options.nth(i).click();
        break;
      }
    }

    if (newPosition === initialPosition) {
      test.skip(true, 'No alternative position available to test');
    }

    const updateButton = adminPage.getByRole('button', { name: 'Update' });
    await expect(updateButton).toBeEnabled();
    await updateButton.click();

    await expect(updateButton).toBeDisabled({ timeout: 10000 });

    await expect(positionSelect).toContainText(newPosition);

    await positionSelect.click();
    const revertOption = adminPage.locator(
      `[role="option"]:has-text("${initialPosition}")`,
    );
    await revertOption.click();
    await updateButton.click();
    await expect(updateButton).toBeDisabled({ timeout: 10000 });
    await expect(positionSelect).toContainText(initialPosition);
  });

  test("Permissions: employee cannot edit another user's data", async ({
    employeePage,
  }) => {
    await employeePage.goto('/users');

    const searchInput = employeePage.getByPlaceholder(/search/i);
    await searchInput.fill('TestAdmin');
    await employeePage.waitForTimeout(500);

    const firstRow = employeePage.locator('table tbody tr').first();

    const arrowButton = firstRow.locator('a[aria-label^="Open"]');
    await arrowButton.click();
    await employeePage.waitForURL(/\/users\/[\w-]+/);

    const firstNameInput = employeePage.getByRole('textbox', {
      name: 'First Name',
    });
    const lastNameInput = employeePage.getByRole('textbox', {
      name: 'Last Name',
    });
    const departmentSelect = employeePage.getByRole('combobox', {
      name: 'Department',
    });
    const positionSelect = employeePage.getByRole('combobox', {
      name: 'Position',
    });

    await expect(firstNameInput).toBeDisabled();
    await expect(lastNameInput).toBeDisabled();
    await expect(departmentSelect).toBeDisabled();
    await expect(positionSelect).toBeDisabled();

    const updateButton = employeePage.getByRole('button', { name: 'Update' });
    await expect(updateButton).not.toBeVisible();

    await expect(
      employeePage.getByRole('button', { name: /Create user/i }),
    ).not.toBeVisible();
  });
});
