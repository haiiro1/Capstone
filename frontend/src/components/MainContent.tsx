import { Link } from "react-router-dom";
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
          <Link to="/ayuda" className="btn btn-body">
            Ayuda
          </Link>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

export default MainContent;
