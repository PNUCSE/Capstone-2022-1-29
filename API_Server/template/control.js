module.exports = {
    HTML:function(cor){
      return `
      <!DOCTYPE html>
<html>
    <style>
        .input{
            margin: auto;
        }
    </style>
    <body>
        <form action="/default/control" method="post">
            <input finish ="finish" type="text" name="finish" placeholder="finish">
            <input control_x ="control_x" type="text" name="control_x" placeholder="control_x">
            <input control_y ="control_y" type="text" name="control_y" placeholder="control_y">
            <input type="submit">
        </form>
        ${cor}
    </body>
</html>
      `;
    },Coordinates:function(finish=0, x=0 ,y=0){
      return `<h1>
      finish = ${finish} x = ${x} y = ${y} 
      </h1>`;
    }
  }