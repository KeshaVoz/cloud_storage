import {useCallback, useRef, useState} from "react";

export const useLongPress = (
    onLongPress,
    onClick,
    {shouldPreventDefault = false, delay = 500} = {}
) => {
    const [longPressTriggered, setLongPressTriggered] = useState(false);
    const timeout = useRef();
    const target = useRef();
    const startPos = useRef({x: 0, y: 0});

    const start = useCallback(
        event => {
            if (shouldPreventDefault && event.target) {
                event.target.addEventListener("touchend", preventDefault, {
                    passive: false
                });
                target.current = event.target;
            }
            if (isTouchEvent(event)) {
                startPos.current = {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY
                };
            }

            timeout.current = setTimeout(() => {
                onLongPress(event);
                setLongPressTriggered(true);
            }, delay);
        },
        [onLongPress, delay, shouldPreventDefault]
    );

    const clear = useCallback(
        (event, shouldTriggerClick = true) => {
            timeout.current && clearTimeout(timeout.current);
            shouldTriggerClick && !longPressTriggered && onClick();
            setLongPressTriggered(false);
            if (shouldPreventDefault && target.current) {
                target.current.removeEventListener("touchend", preventDefault);
            }
        },
        [shouldPreventDefault, onClick, longPressTriggered]
    );

    const handleTouchMove = useCallback(
        event => {
            if (isTouchEvent(event)) {
                const currentPos = {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY
                };
                if (
                    Math.abs(currentPos.x - startPos.current.x) > 50 ||
                    Math.abs(currentPos.y - startPos.current.y) > 50
                ) {
                    clear(event, false);
                }
            }
        },
        [clear]
    );

    return {
        onTouchStart: e => start(e),
        onTouchMove: handleTouchMove,
        onMouseLeave: e => clear(e, false),
        onTouchEnd: e => clear(e, false)
    };
};

const isTouchEvent = event => {
    return "touches" in event;
};

const preventDefault = event => {
    if (!isTouchEvent(event)) return;

    if (event.touches.length < 2 && event.preventDefault) {
        event.preventDefault();
    }
};