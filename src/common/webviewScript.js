export default `

setTimeout(()=>{
    var head = document.head || document.getElementsByTagName('head')[0];
    var children =  document.querySelectorAll("meta[name='viewport']"); 
    var childArray = Array.prototype.slice.call(children); 
    childArray.forEach(function(child){ child.parentNode.removeChild(child); }) ;
    var meta = document.createElement('meta'); 
    meta.setAttribute('content', 'width=device-width, maximum-scale=1.0, initial-scale=1, user-scalable=0'); 
    meta.setAttribute('name', 'viewport');
    head.appendChild(meta);
    var style = document.createElement('style')
    style.type = 'text/css';
    var css = \`
    html,div {
      scroll-behavior: smooth;
    }

    select,
    textarea,
    input {
      font-size: 16px !important;
    }
    
    \`;
    if (style.styleSheet){
    style.styleSheet.cssText =  css
    } else {
        style.appendChild(document.createTextNode(css));
    }
    head.appendChild(style);
   

function rn_check_web(){
  var head = document.head || document.getElementsByTagName('head')[0];
  if (head == null){
    setTimeout(rn_check_web,50)
  }
  var children =  document.querySelectorAll("meta[name='viewport']"); 
  var childArray = Array.prototype.slice.call(children); 
  childArray.forEach(function(child){ child.parentNode.removeChild(child); }) ;
  var meta = document.createElement('meta'); 
  meta.setAttribute('content', 'width=device-width, maximum-scale=1.0, initial-scale=1, user-scalable=0'); 
  meta.setAttribute('name', 'viewport');
  head.appendChild(meta);
  var style = document.createElement('style')
  style.type = 'text/css';
  var css = \`
  html,div {
    scroll-behavior: smooth;
  }

  select,
  textarea,
  input {
    font-size: 16px !important;
  }
  
  \`;
  if (style.styleSheet){
  style.styleSheet.cssText =  css
  } else {
      style.appendChild(document.createTextNode(css));
  }
  head.appendChild(style);
};

`

 
  