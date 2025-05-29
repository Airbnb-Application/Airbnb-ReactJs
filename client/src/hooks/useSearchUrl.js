import { create } from "zustand";

const useSearchUrl = create((set) => ({
   searchUrl: "",
   setSearchUrl: (url) => set({searchUrl: url}),
}))

export default useSearchUrl;