import { create } from "zustand";

type ContactState = {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
};

export const useContactStore = create<ContactState>((set) => ({
  open: false,
  openModal: () => set({ open: true }),
  closeModal: () => set({ open: false }),
}));
