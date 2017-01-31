'use strict';

class Cards {
  constuctor() {
    this.cards = document.querySelectorAll('.card');
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
    this.update = this.update.bind(this);
    this.target = null;
    this.targetBCR = null;
    this.startX = 0;
    this.currentX = 0;
    this.screenX = 0;
    this.targetX = 0;
    this.draggingCard = false;
    this.addEventListener();
    requestAnimationFrame(this.update);
  }
  
  addEventListener() {
    document.addEventListener("touchstart", this.onStart);
    document.addEventListener("touchmove", this.onMove);
    document.addEventListener("touchend", this.onEnd);
    document.addEventListener("mousedown", this.onStart);
    document.addEventListener("mousemove", this.onMove);
    document.addEventListener("mouseup", this.onEnd);
  }

  onStart(e) {
   e.preventDefault();
   if(!e.target.classList.contains("card"))
     return;
   this.draggingCard = true;
   this.target = e.target;
   this.targetBCR = this.target.getBoundingClientRect();
   this.startX = e.pageX || e.touches[0].pageX;
   this.currentX = this.startX;
   this.target.style.willChange = "transform";
 }

 onMove(e) {
   if(!this.target)
     return;
   this.currentX = e.pageX || e.touches[0].pageX;
 }

 onEnd(e) {
   if(!this.target)
     return;
   this.targetX = 0;
   let screenX = this.currentX - this.startX;
   if(Math.abs(screenX) > this.targetBCR.width * .35){
     this.targetX = ( screenX > 0) ? this.targetBCR.width : -this.targetBCR.width;
   }
   this.draggingCard = false;
 }

 update() {
   requestAnimationFrame(this.update);
   if(!this.target)
     return;

   if(this.draggingCard){
     this.screenX = this.currentX - this.startX;
   } else {
     this.screenX += (this.targetX - this.screenX)/4;
   }
   const normalizeDistance = Math.abs(this.screenX / this.targetBCR.width);
   const opacity = 1 - Math.pow(normalizeDistance, 3);

   this.target.style.transform = `translateX(${this.screenX}px)`;
   this.target.style.opacity = opacity;
   const nearlyInvis = (opacity < .01);
   const nearStart = (Math.abs(this.screenX)<.01);

   if(!this.draggingCard) {
     if(nearlyInvis){
       if(!this.target || !this.target.parentNode)
         return;
         // not so many if statements

       let isAfterCurrentCard = false;
       for(let i = 0; this.cards.length>i; i++){
         let card = this.cards[i];
         if(card === this.target) {
           isAfterCurrentCard = true;
           continue;
         }
         if(!isAfterCurrentCard)
           continue;

         const onTransitionEnd = _=> {
           this.target = null;
           card.style.transition = "none";
           card.removeEventListener("transitionend", onTransitionEnd);
         }
         card.style.transform = `translateY(${this.targetBCR.height+20}px)`;
         requestAnimationFrame( _ => {
           card.style.transition = "transform 1s cubic-bezier(0,0,0.31,1)";
           card.style.transform = "none";
         })
         card.addEventListener("transitionend", onTransitionEnd)
       }

       if(this.target && this.target.parentNode)
         this.target.parentNode.removeChild(this.target);
     }

     if(nearStart){
       this.target.style.willChange = "initial";
       this.target.style.transform = "none";
       this.target = null;
     }
   }
 }
}

window.addEventListener("load", () => new Cards());
