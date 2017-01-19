/**
 * Created by isung on 1/18/17.
 */
/*
 Actions and events for the hex tiles
 */
export const onMouseEnter = (hex, event) => {
    console.log('onMouseEnter', hex, event);
}
export const onMouseLeave = (hex, event) => {
    console.log('onMouseLeave', hex, event);
}
export const onClick = (hex, event) => {
    event.preventDefault();
    console.log('onClick', hex, event);
}