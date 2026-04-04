import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import * as React from "react";
import {IconButton, InputAdornment} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";


export default function ValidatedTextField({id, label, value, onChange, helperText, placeholder}) {

    const [showPassword, setShowPassword] = React.useState(false);
    const handlePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <FormControl variant='outlined' style={{marginBottom: 10, width: '100%'}}>

            <TextField
                id={id}
                name={id}
                label={label}
                value={value}
                onChange={onChange}
                helperText={helperText}
                placeholder={placeholder}
                type={!id.startsWith("password") ? 'text' : (showPassword ? "text" : "password")}
                slotProps={
                    id.startsWith("password") ?
                        {
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handlePasswordVisibility}
                                            edge="end"
                                            aria-label="toggle password visibility"
                                        >
                                            {showPassword ? <Visibility/> : <VisibilityOff/>}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }
                        }
                        :
                        null
                }
            />
        </FormControl>
    )
}
