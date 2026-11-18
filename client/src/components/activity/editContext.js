import { createContext, useContext } from 'react';

/**
 * EditContext — an activity workspace is read-only until "Edit activity" is pressed.
 * Every tab reads `useEditing()` and greys out anything that changes data when it is false.
 */
export const EditContext = createContext(false);
export const useEditing = () => useContext(EditContext);
