// src/DndWrapper.jsx
import { DndProvider } from "react-dnd";
import { MultiBackend } from "react-dnd-multi-backend";
import { TouchTransition, MouseTransition } from "react-dnd-multi-backend";
import { HTML5Backend } from "react-dnd-html5-backend";

const HTML5toTouch = {
  backends: [
    {
      backend: HTML5Backend,
      transition: MouseTransition,
    },
    {
      backend: HTML5Backend,
      transition: TouchTransition,
      options: { enableTouchEvents: true },
    },
  ],
};

export const DndWrapper = ({ children }) => {
  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      {children}
    </DndProvider>
  );
};
