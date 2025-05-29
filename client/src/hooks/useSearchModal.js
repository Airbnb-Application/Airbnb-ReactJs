import { create } from "zustand";

const useSearchModal = create((set) => ({
    isOpenLocation: false,
    onOpenLocation: () => set({ isOpenLocation: true }),  
    onCloseLocation: () => set({ isOpenLocation: false }),

    isOpenDate: false,
    onOpenDate: () => set({ isOpenDate: true }),
    onCloseDate: () => set({ isOpenDate: false }),

    isOpenCount: false,
    onOpenCount: () => set({ isOpenCount: true }),
    onCloseCount: () => set({ isOpenCount: false }),

    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}))

export default useSearchModal;