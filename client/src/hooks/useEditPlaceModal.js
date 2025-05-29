import { create } from "zustand";

const useEditPlaceModal = create((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false}),
}))

export default useEditPlaceModal;




