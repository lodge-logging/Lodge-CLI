const art = require("ascii-art");
let Color = require("ascii-art-ansi/color");
Color.is256 = true;
console.log("Thank you for installing Lodge CLI");
console.log(`To get started, run ${art.style("lodge init", "yellow")}`);
art.font("LODGE", "DOOM", (err, res) => {
  console.log(art.style(res, "cyan"));
});
// art
//   .image({
//     width: 50,
//     height: 40,
//     filepath: "./Lodge_graphic_color.png",
//     alphabet: "blocks",
//   })
//   .font("LODGE", "DOOM", "cyan", (err, res) => {
//     console.log(err || res);
//   });

// console.log('Run "lodge help" for more information');
// console.log("          ^");
// console.log("        /  \\");
// console.log("       / ---\\");
// console.log("      /      \\");
// console.log("     / -------\\");
// console.log("    /          \\");
// console.log("--  -------  ---\\");
// console.log("                 \\");
// console.log("----  ------------\\");
// console.log("                    ");
// console.log("------  ------------");
// console.log("");
// console.log("--------------------");
