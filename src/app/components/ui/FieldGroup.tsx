import React from 'react';

const FieldGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={`${className} flex flex-col gap-2`} {...props}>
        {children}
      </div>
    );
  }
);

FieldGroup.displayName = 'FieldGroup';

export default FieldGroup; 