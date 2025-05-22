Popzy.elements = []
function Popzy(options = {}) {
    this.opt = Object.assign({
        // content,
        // templateId, 
        closeMethods:['button', 'overlay', 'escape'], 
        destroyOnClose:true,
        footer:true, 
        cssClass:[],
        // onOpen,
        // onClose
        }, options)
    if (!this.opt.content && !this.opt.templateId) {
        console.error("You must provide one of 'content' or 'templateId'.")
        return
    }
    if (this.opt.content && this.opt.templateId) {
        this.templateId = null;
        console.warn("Both 'content' and 'templateId' are specified. 'content' will take precedence, and 'templateId' will be ignored.")
    }
    if (this.opt.templateId) {
        this.template = document.querySelector(`#${this.opt.templateId}`)
        if (!this.template) {
            console.error("Template Id does not exist");
        }
    }
    // cho phep dong
    this._allowBackdropClose = this.opt.closeMethods.includes('overlay')
    this._allowButtonClose = this.opt.closeMethods.includes('button')
    this._allowEscapeClose = this.opt.closeMethods.includes('escape')
    this._footerButtons = []
    this._handleEscapeBtn = this._handleEscapeBtn.bind(this)
    // tinh do dai thanh cuon
}
Popzy.prototype._getScrollBarWidth = function() {
    if (this._scrollBarWidth) return this._scrollBarWidth
    const div = document.createElement('div')
    Object.assign(div.style, {
        overflow: 'scroll',
        position:'absolute',
        top: '-9999px'
    })
    document.body.appendChild(div)
    this._scrollBarWidth = div.offsetWidth - div.clientWidth
    document.body.removeChild(div)
    return this._scrollBarWidth
}
 // create backdrop
 Popzy.prototype._build = function() {
    this._backdrop = document.createElement('div')
    this._backdrop.className = 'popzy__backdrop'

    const container = document.createElement('div')
    container.className = 'popzy__container'
    this.opt.cssClass.forEach(className => {
        container.classList.add(className)
    });
    this._modalContent = document.createElement('div')
    this._modalContent.className = 'popzy__content'

    if (this._allowButtonClose) {
        const modalClose = this._createButton('&times', 'popzy__close', () => this.close())
        // close bang nut
        container.append(modalClose)
    }
    // Apeend phan tu va content vao dom
    if (this.opt.content) {
        this._modalContent.innerHTML = this.opt.content
    }
    if (this._content) {
        this._modalContent.innerHTML = this._content
    }
    const content = this.template.content.cloneNode(true)
    this._modalContent.append(content)
    container.append(this._modalContent)
    if (this.opt.footer) {
        this._modalFooter = document.createElement('div')
        this._modalFooter.className = 'popzy__footer'
        container.append(this._modalFooter)
        this._renderFooterContent()
        this._renderButton()
    }
    this._backdrop.append(container)
    document.body.append(this._backdrop)
}
// set content cho modal
Popzy.prototype.setContent = function(content) {
    this._content = content
}
// set content cho footer
Popzy.prototype.setFooterContent = function(content) {
    this._footerContent = content
    this._renderFooterContent()
}
// render content 
Popzy.prototype._renderFooterContent = function() {
    if (this._modalFooter && this._footerContent) {
        this._modalFooter.innerHTML = this._footerContent
    }
}
// them button cho footer 
Popzy.prototype.addFooterButtons = function(name, className, callback) {
    const btn = this._createButton(name,className,callback)
    this._footerButtons.push(btn)
    this._renderButton()
}
// render button
Popzy.prototype._renderButton = function() {
    if (this._modalFooter) {
        this._footerButtons.forEach(btn => {
            this._modalFooter.append(btn)
        })
    }
}
Popzy.prototype._createButton = function(name, className, callback) {
    const btn = document.createElement('button')
    btn.className = className
    btn.innerHTML = name
    btn.onclick = callback
    // nếu callback là this.close thì phương thức onclick sẽ được gán là this.close nên khi nó được gọi sẽ trỏ tới đối tượng btn
    return btn
}
Popzy.prototype.open = function() {
    if (!this._backdrop) {
        this._build()
    }
    Popzy.elements.push(this)
    setTimeout(() => {
        this._backdrop.classList.add('popzy--show')
    }, 0)
    // close bang overlay
    if (this._allowBackdropClose) {
        this._backdrop.onclick = (e) => {
            if (e.target === this._backdrop) {
                this.close()
            }
        }
    }
    // close bang nut escape
    if (this._allowEscapeClose) {
        document.body.addEventListener('keydown', this._handleEscapeBtn)
        // document.onkeydown = this._handleEscapeBtn
        // document.onkeydown()
        // khi this._handleEscape Btn được gán vào phương thức nên khi phương thức được gọi nó sẽ trỏ tới đối tượng gọi nó là document
    }
    // disable scrolling
    document.body.classList.add('popzy--no-scroll')
    if (document.body.classList.contains('popzy--no-scroll')) {
        document.body.style.paddingRight = this._getScrollBarWidth() + 'px'
    }
    this._ontransitioned(this.opt.onOpen) 
}
Popzy.prototype._handleEscapeBtn =  function(e) {
   const lastModal = Popzy.elements[Popzy.elements.length - 1]
   if (e.key === 'Escape' && this === lastModal) {
        this.close()
   }
}
Popzy.prototype._ontransitioned = function(callback) {
    this._backdrop.ontransitionend = (e) => {
        if (e.propertyName !== 'transform') return
    }
    if (typeof callback === 'function') callback()
}
Popzy.prototype.close = function(destroy = this.opt.destroyOnClose) {
    this._backdrop.classList.remove('popzy--show')
    Popzy.elements.pop()
    if (this._allowEscapeClose) {
        document.body.removeEventListener('keydown',this._handleEscapeBtn)
    }
    this._ontransitioned(() => {
        if (destroy && this._backdrop) {
            this._backdrop.remove()
            this._backdrop = null
            this._modalFooter = null
            // nếu destroy = true thì xoá toàn bộ element ra khỏi dom
        }
        if (typeof this.opt.onClose === 'function') this.opt.onClose()
        if (!Popzy.elements.length) {
            document.body.classList.remove('popzy--no-scroll')
            document.body.style.paddingRight = ''
        }  
    })
}
