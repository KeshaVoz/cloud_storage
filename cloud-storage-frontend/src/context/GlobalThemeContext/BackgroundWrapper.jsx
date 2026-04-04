import {Stack, styled} from "@mui/material";

export const BackgroundWrapper = styled(Stack)(({theme}) => ({
    position: 'relative',
    minHeight: '100%',
    width: '100%',
    overflow: 'hidden',

    '&::before': {
        content: '""',
        position: 'fixed',
        zIndex: 0,
        bottom: 0,
        left: 0,

        width: '100%',
        height: '100%',
        backgroundImage: theme.palette.mode === 'dark'
            ? 'radial-gradient(at 50% 50%, hsla(210, 100%, 13%, 0.7), hsl(220, 30%, 5%))'
            : 'none',
        backgroundRepeat: 'round',
        backgroundAttachment: 'scroll',
    },

    '& > *': {
        position: 'relative',
        zIndex: 1
    }
}));