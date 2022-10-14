module.exports = {
    HTML:function(title, list){
      return `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body>
        <h1><a href="/">${title}</a></h1>
        ${list}
      </body>
      </html>
      `;
    },list:function(filelist){
      var list = '<ul>';
      var i = 0;
      while(i < filelist.length){
        list = list + `<button target="_blank" onclick = "window.location='/modeling/${filelist[i]}'">${filelist[i]}</button>`
        i = i + 1;
      }
      list = list+'</ul>';
      return list;
    }
  }
  