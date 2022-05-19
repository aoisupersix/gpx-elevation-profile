import React from 'react'

import { ColorResult, RGBColor, SketchPicker } from 'react-color'
import styled from 'styled-components'

interface ColorPickerProps {
    className?: string
    color: RGBColor
    onChange?: (color: ColorResult) => void
}

const Swatch = styled.div`
    padding: 5px;
    background: #f0f0f0;
    border-radius: 1px;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
    display: inline-block;
    cursor: pointer;
`

const Color = styled.div<{ bgcolor: RGBColor }>`
    width: 40px;
    height: 15px;
    border-radius: 2px;
    background: ${(props) =>
        `rgba(${props.bgcolor.r},${props.bgcolor.g},${props.bgcolor.b},${props.bgcolor.a})`};
`

const PopOver = styled.div`
    position: absolute;
    z-index: 2;
`

const Cover = styled.div`
    position: fixed;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;
`

export const ColorPicker: React.FC<ColorPickerProps> = (props) => {
    const [displayPicker, setDisplayPicker] = React.useState(false)
    return (
        <div className={props.className}>
            <Swatch onClick={() => setDisplayPicker(!displayPicker)}>
                <Color bgcolor={props.color} />
            </Swatch>
            {displayPicker && (
                <PopOver>
                    <Cover onClick={() => setDisplayPicker(false)} />
                    <SketchPicker
                        color={props.color}
                        onChange={props.onChange}
                    />
                </PopOver>
            )}
        </div>
    )
}
