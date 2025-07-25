import React, { memo, forwardRef } from 'react';
import { FixedSizeList as List } from 'react-window';

interface VirtualizedListProps {
  items: any[];
  height: number;
  width?: string | number;
  itemHeight: number;
  renderItem: (props: { index: number; style: React.CSSProperties; data: any[] }) => React.ReactElement;
  className?: string;
}

const VirtualizedList = memo(forwardRef<any, VirtualizedListProps>(
  ({ items, height, width = '100%', itemHeight, renderItem, className }, ref) => {
    return (
      <div className={className}>
        <List
          ref={ref}
          height={height}
          width={width}
          itemCount={items.length}
          itemSize={itemHeight}
          itemData={items}
        >
          {renderItem}
        </List>
      </div>
    );
  }
));

VirtualizedList.displayName = 'VirtualizedList';

export default VirtualizedList;