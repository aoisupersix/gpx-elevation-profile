import React from 'react'

interface SpacerProps {
    size: number
    axis: 'vertical' | 'horizontal'
}

export const Spacer: React.FC<SpacerProps> = (props) => {
    const width = props.axis === 'vertical' ? 1 : props.size
    const height = props.axis === 'horizontal' ? 1 : props.size
    return (
        <span
            style={{
                display: 'block',
                width,
                minWidth: width,
                height,
                minHeight: height,
            }}
        />
    )
}
