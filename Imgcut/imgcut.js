var postFile = {
         init: function() {
               var t = this;
               t.regional = document.getElementById('label');
               t.getImage = document.getElementById('get_image');
               t.editPic = document.getElementById('edit_pic');
               t.editBox = document.getElementById('cover_box');
               t.changeSize=0;
               t.px = 0;    //background image x
               t.py = 0;    //background image y
               t.sx = 15;    //crop area x
               t.sy = 15;    //crop area y
               t.sHeight = 150;    //crop area height
               t.sWidth = 150;    //crop area width
               document.getElementById('post_file').addEventListener("change", t.handleFiles, false);
               document.getElementById('save_button').onclick = function() {
                   t.editPic.height = t.sHeight + t.changeSize;
                   t.editPic.width = t.sWidth + t.changeSize;
                   var ctx = t.editPic.getContext('2d');
                   var images = new Image();
                   images.src = t.imgUrl;

                   images.onload = function(){
                       var profile_picture=t.editPic.toDataURL();
                       ctx.drawImage(images,t.sx, t.sy, t.sWidth + t.changeSize,  t.sHeight + t.changeSize, 0, 0, t.sWidth + t.changeSize, t.sHeight +t.changeSize);
                       document.getElementById('show_pic').getElementsByTagName('img')[0].src = t.editPic.toDataURL();

                       //send user profile_picture url
                    $.ajax({
                          type: "POST",
                          url: "",
                          data: profile_picture,
                          success: function(data){
                                if(data){
                                  alert("设置头像成功");
                                }else{
                                  alert("设置失败，请重新上传。");
                                }
                              }
                       });
                   };
               };
             },
         handleFiles: function() {
               var fileList = this.files[0];
               var oFReader = new FileReader();
               oFReader.readAsDataURL(fileList);
               oFReader.onload = function (oFREvent) {
                   postFile.paintImage(oFREvent.target.result);
               };
        },
         paintImage: function(url) {
           var t = this;
           var createCanvas = t.getImage.getContext("2d");
           var img = new Image();
           img.src = url;
           img.onload = function(){

               if ( img.width < t.regional.offsetWidth && img.height < t.regional.offsetHeight) {
                   t.imgWidth = img.width;
                   t.imgHeight = img.height;

               } else {
                   var pWidth = img.width / (img.height / t.regional.offsetHeight);
                   var pHeight = img.height / (img.width / t.regional.offsetWidth);
                   t.imgWidth = img.width > img.height ? t.regional.offsetWidth : pWidth;
                   t.imgHeight = img.height > img.width ? t.regional.offsetHeight : pHeight;
               }
               t.px = (t.regional.offsetWidth - t.imgWidth) / 2 + 'px';
               t.py = (t.regional.offsetHeight - t.imgHeight) / 2 + 'px';

               t.getImage.height = t.imgHeight;
               t.getImage.width = t.imgWidth;
               t.getImage.style.left = t.px;
               t.getImage.style.top = t.py;

               createCanvas.drawImage(img,0,0,t.imgWidth,t.imgHeight);
               t.imgUrl = t.getImage.toDataURL();
               t.cutImage();
               t.drag();
           };
         },
         cutImage: function() {
            var t = this;

            //绘制遮罩层：
            t.editBox.height = t.imgHeight;
            t.editBox.width = t.imgWidth;
            t.editBox.style.display = 'block';
            t.editBox.style.left = t.px;
            t.editBox.style.top = t.py;

            var cover = t.editBox.getContext("2d");
            cover.fillStyle = "rgba(0, 0, 0, 0.5)";
            cover.fillRect (0,0, t.imgWidth, t.imgHeight);
            cover.clearRect(t.sx, t.sy, t.sHeight, t.sWidth);


            var resize=document.getElementById('resize_cut'),
                dragLimit=document.getElementById('resize');

                resize.onmousedown=function(event){
                    var endX,
                        smallLimitX,
                        bigLimitX,
                        draing=false;

                    this.style.cursor="move";

                    endX=event.clientX-this.offsetLeft;

                    //get the limit of drag
                    smallLimitX=event.clientX-dragLimit.offsetLeft;
                    bigLimitX=dragLimit.offsetWidth;

                    this.onmousemove=function(event){
                        draing=true;

                        if(draing){

                            //set the limit of the drag change
                            if((event.clientX-endX)< 0|| (event.clientX-endX)>bigLimitX){
                                return false;
                            }

                            //get the drag-size to change the cutbox-size
                            t.changeSize=Math.floor((event.clientX-endX)/2);
                            resize.style.left=(event.clientX-endX)+'px';

                            //change the cover box size
                            cover.clearRect(0, 0, t.imgWidth, t.imgHeight);
                            cover.fillRect (0,0, t.imgWidth, t.imgHeight);
                            cover.clearRect(t.sx, t.sy, t.sHeight + t.changeSize, t.sWidth + t.changeSize);

                            //get the cutImage after resize intime
                            document.getElementById('show_edit').style.height = (t.sHeight + t.changeSize) + 'px';
                            document.getElementById('show_edit').style.width = (t.sWidth + t.changeSize)+ 'px';
                        }else{

                            this.style.cursor="auto";
                        }
                    };

                    this.onmouseup=function(){
                        draing=false;

                        this.onmousemove=null;
                    };
                };

            //预览图片

            document.getElementById('show_edit').style.background = 'url(' + t.imgUrl + ')' + -t.sx + 'px ' + -t.sy + 'px no-repeat';
            document.getElementById('show_edit').style.height = (t.sHeight + t.changeSize) + 'px';
            document.getElementById('show_edit').style.width = (t.sWidth + t.changeSize)+ 'px';

        },
           drag: function() {
               var t = this;
               var draging = false;
               var startX = 0;
               var startY = 0;

               document.getElementById('cover_box').onmousemove = function(e) {
                   var pageX = e.pageX - ( t.regional.offsetLeft + this.offsetLeft );
                   var pageY = e.pageY - ( t.regional.offsetTop + this.offsetTop );

                   if ( pageX > t.sx && pageX < t.sx + t.sWidth && pageY > t.sy && pageY < t.sy + t.sHeight ) {
                       this.style.cursor = 'move';

                       this.onmousedown = function(){
                           draging = true;

                           t.ex = t.sx;
                           t.ey = t.sy;

                           startX = e.pageX - ( t.regional.offsetLeft + this.offsetLeft );
                           startY = e.pageY - ( t.regional.offsetTop + this.offsetTop );

                       };
                       window.onmouseup = function() {
                           draging = false;
                       };

                       if (draging) {

                           if ( t.ex + (pageX - startX) < 0 ) {
                               t.sx = 0;
                           } else if ( t.ex + (pageX - startX) + t.sWidth > t.imgWidth) {
                               t.sx = t.imgWidth - t.sWidth;
                           } else {
                               t.sx = t.ex + (pageX - startX);
                           }

                           if (t.ey + (pageY - startY) < 0) {
                               t.sy = 0;
                           } else if ( t.ey + (pageY - startY) + t.sHeight > t.imgHeight ) {
                               t.sy = t.imgHeight - t.sHeight;
                           } else {
                               t.sy = t.ey + (pageY - startY);
                           }

                           t.cutImage();
                       }
                   } else{
                       this.style.cursor = 'auto';
                   }
               };
           },
};

postFile.init();
