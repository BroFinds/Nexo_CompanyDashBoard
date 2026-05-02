import React from "react";

const InfiniteScrollLoader = ({ label = "Loading more...", style }) => (
  <div className="infinite-loader" style={style}>
    <span className="infinite-loader__spinner" aria-hidden="true" />
    <span className="infinite-loader__label">{label}</span>
  </div>
);

export default InfiniteScrollLoader;
