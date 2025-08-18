import { type ReactNode } from "react";
interface MainContentProps {
  title: string;
  children: ReactNode;
}

function MainContent({ title, children }: MainContentProps) {
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">{title}</h2>
        <div>
          <button className="btn btn-light me-2">Feedback</button>
          <button className="btn btn-light">Ayuda</button>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

export default MainContent;
