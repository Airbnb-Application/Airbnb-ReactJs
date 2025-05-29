import { create } from "zustand";
const useEditProfileModal = create((set) => ({
  isUserEdit: false,
  onUserOpen: () => set({ isUserEdit: true }),
  onUserClose: () => set({ isUserEdit: false }),

  isChangePassword: false,
  onChangePasswordOpen: () => set({ isChangePassword: true }),
  onChangePasswordClose: () => set({ isChangePassword: false }),
}));

export default useEditProfileModal;
