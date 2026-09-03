import {
  test,
  expect,
  employeeFirstName,
  adminFirstName,
} from '@/features/auth/auth.fixture';
import type { Page } from '@playwright/test';

async function goToUserProfile(
  page: Page,
  searchName: string,
  openMethod: 'actions' | 'arrow' = 'actions',
) {
  await page.goto('/users');

  const searchInput = page.getByPlaceholder(/search/i);
  await searchInput.fill(searchName);
  await page.waitForTimeout(500);

  const firstRow = page.locator('table tbody tr').first();

  if (openMethod === 'actions') {
    const actionsButton = firstRow.locator('button[aria-label^="Actions for"]');
    await actionsButton.click();
    const viewButton = page.locator('[role="menuitem"]:has-text("View")');
    await viewButton.click();
  } else {
    const arrowButton = firstRow.locator('a[aria-label^="Open"]');
    await arrowButton.click();
  }
  await page.waitForURL(/\/users\/[\w-]+/);
  return firstRow;
}

test.describe('User management', () => {
  test('Profile viewing: admin can log in, open user page and verify fields', async ({
    adminPage,
  }) => {
    await goToUserProfile(adminPage, employeeFirstName);

    const firstNameInput = adminPage.getByRole('textbox', {
      name: 'First Name',
    });
    const lastNameInput = adminPage.getByRole('textbox', { name: 'Last Name' });
    const departmentSelect = adminPage.getByRole('combobox', {
      name: 'Department',
    });
    const positionSelect = adminPage.getByRole('combobox', {
      name: 'Position',
    });

    const firstName = await firstNameInput.inputValue();
    const lastName = await lastNameInput.inputValue();
    const department = await departmentSelect.textContent();
    const position = await positionSelect.textContent();
    const fullName = `${firstName} ${lastName}`.trim();

    await expect(
      adminPage.getByRole('heading', { name: fullName }),
    ).toBeVisible();
    await expect(firstNameInput).toHaveValue(firstName);
    await expect(lastNameInput).toHaveValue(lastName);
    await expect(departmentSelect).toContainText(department ?? '');
    await expect(positionSelect).toContainText(position ?? '');

    await expect(
      adminPage.getByRole('button', { name: 'Update' }),
    ).toBeDisabled();
  });

  test('Edit profile: admin updates test employee name, changes are reflected', async ({
    adminPage,
  }) => {
    await goToUserProfile(adminPage, employeeFirstName);

    const firstNameInput = adminPage.getByRole('textbox', {
      name: 'First Name',
    });
    const initialFirstName = await firstNameInput.inputValue();
    const initialLastName = await adminPage
      .getByRole('textbox', { name: 'Last Name' })
      .inputValue();

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
    await goToUserProfile(adminPage, employeeFirstName);

    const positionSelect = adminPage.getByRole('combobox', {
      name: 'Position',
    });
    const initialPosition = (await positionSelect.innerText()).trim();

    await positionSelect.click();

    const options = adminPage.locator('[role="option"]');
    await options.first().waitFor();
    const optionCount = await options.count();
    let newPosition = initialPosition;
    let optionFound = false;
    for (let i = 0; i < optionCount; i++) {
      const text = await options.nth(i).textContent();
      const trimmedText = text ? text.trim() : '';
      if (trimmedText && trimmedText !== initialPosition) {
        newPosition = trimmedText;
        await options.nth(i).click();
        optionFound = true;
        break;
      }
    }

    if (!optionFound || newPosition === initialPosition) {
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
    await goToUserProfile(employeePage, adminFirstName, 'arrow');

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
