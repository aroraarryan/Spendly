# Manual Test Script: Add Expense Modal

Follow these step-by-step instructions to verify that every part of the Add Expense Modal is working correctly.

## 1. Opening the Modal & Initial State
- [ ] Open the app and navigate to the Home screen.
- [ ] Tap the global floating action button (FAB) `+` at the bottom.
- [ ] **Verify:** The modal slides up smoothly from the bottom using a spring animation.
- [ ] **Verify:** The background behind the sheet darkens (semi-transparent overlay).
- [ ] **Verify:** The sheet has a rounded grey drag handle at the top center.
- [ ] **Verify:** The modal header reads "Add Expense" in bold.
- [ ] **Verify:** The "Cancel" button is visible on the top left.
- [ ] **Verify:** All fields are reset to defaults:
  - Amount is empty (`0` showing).
  - No category is highlighted.
  - Date is set to today's date.
  - Note is empty.
  - Tag to Event is set to `None`.
  - Recurring expense toggle is OFF.

## 2. Testing the Custom Numpad
- [ ] Tap `1`, `2`, `3` on the custom numpad.
- [ ] **Verify:** The amount display updates instantly to `123`.
- [ ] **Verify:** Each button press triggers a light haptic feedback and a scale animation on the button itself.
- [ ] Tap the backspace `⌫` key.
- [ ] **Verify:** The amount display updates to `12`.
- [ ] Tap the decimal `.` key.
- [ ] **Verify:** The amount display updates to `12.`.
- [ ] Tap `.` again.
- [ ] **Verify:** The second decimal point is ignored.
- [ ] Tap `9`, `9`.
- [ ] **Verify:** The amount display updates to `12.99`.
- [ ] Attempt to add a 3rd decimal place (e.g. tap `9`).
- [ ] **Verify:** The 3rd decimal place is ignored.
- [ ] Clear the amount entirely using the backspace `⌫` key.

## 3. Form Validation (Negative Tests)
- [ ] With the amount cleared (`0`), tap the "Save Expense" button.
- [ ] **Verify:** The amount text turns red and shakes rapidly left-to-right. A "Please enter an amount" error text appears below it.
- [ ] Enter a valid amount (e.g., `500`).
- [ ] Do not select a category.
- [ ] Tap the "Save Expense" button.
- [ ] **Verify:** The Category horizontal scroll list shakes rapidly and a red border highlights the row.
- [ ] **Verify:** The modal **does not close** and the expense is **not saved**.

## 4. Input Fields & Interactions
- [ ] **Category Selector:** Scroll through the horizontal list of categories and tap one (e.g., "Food"). 
- [ ] **Verify:** The selected category highlights with a colored background/border.
- [ ] **Date Picker:** Tap the Date row. 
- [ ] **Verify:** The native date picker opens. Select a past date and confirm it updates the row text. Try to select a future date (it should be blocked).
- [ ] **Note Input:** Tap the Note field and type "Groceries".
- [ ] **Verify:** The character count updates (e.g., `9/100`).
- [ ] **Event Selection:** Tap the "Tag to Event" row.
- [ ] **Verify:** An action sheet/modal opens listing active events (if any exist). Select an event or tap "None".
- [ ] **Recurring Toggle:** Tap the "Recurring expense" switch.
- [ ] **Verify:** The switch animates ON (purple track), and the 'Weekly' / 'Monthly' segmented control animates into view below it.
- [ ] **Verify:** You can toggle between Weekly and Monthly.

## 5. Saving a New Expense
- [ ] Ensure an amount and category are selected.
- [ ] Tap the "Save Expense" button.
- [ ] **Verify:** A success haptic feedback fires.
- [ ] **Verify:** The modal slides down and closes smoothly.
- [ ] **Verify:** The Home screen immediately updates to show the new expense in the "Recent Transactions" list and the budget card total updates.

## 6. Edit Mode functionality
- [ ] Locate the expense you just created in the "Recent Transactions" list.
- [ ] Tap on the expense to open the action sheet.
- [ ] Tap "Edit".
- [ ] **Verify:** The modal opens smoothly.
- [ ] **Verify:** The title now reads "Edit Expense".
- [ ] **Verify:** The "Save Expense" button at the bottom now reads "Update Expense".
- [ ] **Verify:** All fields are successfully pre-filled with the exact data of that expense (Amount, Category, Date, Note, Event, Recurring config).
- [ ] Change the amount on the numpad (e.g., add `99`) and change the category to something else.
- [ ] Tap "Update Expense".
- [ ] **Verify:** The modal closes smoothly.
- [ ] **Verify:** The Home screen instantly reflects the updated amount and category for that specific transaction.

## 7. Dismissing via Background Overlay & Cancel Button
- [ ] Open the Add Expense modal again using the FAB `+`.
- [ ] Tap the semi-transparent black overlay above the white sheet.
- [ ] **Verify:** The modal dismisses without saving anything.
- [ ] Open the modal again.
- [ ] Tap the "Cancel" button in the top left corner.
- [ ] **Verify:** The modal dismisses without saving anything.
