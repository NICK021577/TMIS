import { createContext, useContext } from 'react';

/**
 * EditContext — an activity workspace is read-only until "Edit activity" is pressed.
 * Every tab reads `useEditing()` and greys out anything that changes data when it is false.
 * The workspace also turns it off for modules the person's role in this activity cannot edit.
 */
export const EditContext = createContext(false);
export const useEditing = () => useContext(EditContext);

/**
 * AccessContext — what this person's role in this activity allows on the current module.
 *   level    'edit' | 'materials' | 'view'
 *   editing  true while Edit activity is on (regardless of module)
 *   label    their role here ('Committee', 'Resource person', ... or 'Administrator'), null when not assigned
 */
export const AccessContext = createContext({ level: 'edit', editing: false, label: null });
export const useAccess = () => useContext(AccessContext);
