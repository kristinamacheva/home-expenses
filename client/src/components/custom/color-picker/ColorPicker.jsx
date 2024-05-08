// import { useState } from "react";
// import { Button, FormControl, FormLabel } from "@chakra-ui/react";
// import { ChromePicker } from "react-color";

// const ColorPicker = () => {
//   const [color, setColor] = useState("#FFFFFF");
//   const [showPicker, setShowPicker] = useState(false);

//   const handleChange = (newColor) => {
//     setColor(newColor.hex);
//   };

//   const togglePicker = () => {
//     setShowPicker(!showPicker);
//   };

//   const handleClosePicker = () => {
//     setShowPicker(false);
//   };

//   return (
//     <FormControl>
//       <FormLabel>Choose Color</FormLabel>
//       <Button
//         onClick={togglePicker}
//         backgroundColor={color}
//         _hover={{ backgroundColor: color }}
//         color="white"
//       >
//         Pick Color
//       </Button>
//       {showPicker && (
//         <ChromePicker color={color} onChange={handleChange} onClose={handleClosePicker} />
//       )}
//     </FormControl>
//   );
// };

// export default ColorPicker;