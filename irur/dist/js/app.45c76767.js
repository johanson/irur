(function(t){function e(e){for(var n,i,r=e[0],c=e[1],d=e[2],u=0,m=[];u<r.length;u++)i=r[u],Object.prototype.hasOwnProperty.call(o,i)&&o[i]&&m.push(o[i][0]),o[i]=0;for(n in c)Object.prototype.hasOwnProperty.call(c,n)&&(t[n]=c[n]);l&&l(e);while(m.length)m.shift()();return s.push.apply(s,d||[]),a()}function a(){for(var t,e=0;e<s.length;e++){for(var a=s[e],n=!0,r=1;r<a.length;r++){var c=a[r];0!==o[c]&&(n=!1)}n&&(s.splice(e--,1),t=i(i.s=a[0]))}return t}var n={},o={app:0},s=[];function i(e){if(n[e])return n[e].exports;var a=n[e]={i:e,l:!1,exports:{}};return t[e].call(a.exports,a,a.exports,i),a.l=!0,a.exports}i.m=t,i.c=n,i.d=function(t,e,a){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:a})},i.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var a=Object.create(null);if(i.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var n in t)i.d(a,n,function(e){return t[e]}.bind(null,n));return a},i.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="";var r=window["webpackJsonp"]=window["webpackJsonp"]||[],c=r.push.bind(r);r.push=e,r=r.slice();for(var d=0;d<r.length;d++)e(r[d]);var l=c;s.push([0,"chunk-vendors"]),a()})({0:function(t,e,a){t.exports=a("56d7")},"0ddd":function(t,e,a){"use strict";var n=a("8bf4"),o=a.n(n);o.a},"115d":function(t,e,a){},"56d7":function(t,e,a){"use strict";a.r(e);a("a79d");var n=a("2b0e"),o=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{ref:"app",class:"mode-"+t.layout.mode,attrs:{id:"app",tabindex:"0"}},[t.layout.showLoader?a("div",{attrs:{id:"loader"}}):t._e(),a("div",{attrs:{id:"overlay"}}),a("svg-sprite",{on:{loaded:function(e){t.layout.icons=e}}}),a("prompt",{attrs:{params:t.prompt},on:{"switch-mode":function(e){return t.switchMode(e)},callback:function(e){return t.promptCallback(e)}}}),a("undo",{ref:"undo",attrs:{db:t.db},on:{back:function(e){t.db=e,t.sync()}}}),a("tabs",{ref:"tabs",attrs:{db:t.db,layout:t.layout},on:{"switch-tab":function(e){t.layout.activeTab=e},"switch-mode":function(e){return t.switchMode(e)},save:function(e){return t.saveTab(e)},remove:function(e){t.prompt=e}}}),a("remote",{ref:"remote",attrs:{db:t.db,layout:t.layout,settings:t.settings},on:{"switch-mode":function(e){return t.switchMode(e)},sort:function(e){return t.sync("sort")},remove:function(e){t.prompt=e},editor:function(e){return t.showEditor(e)}}}),a("editor",{ref:"editor",attrs:{db:t.db,layout:t.layout,settings:t.settings},on:{"switch-mode":function(e){return t.switchMode(e)},edit:function(e){return t.editKnob(e)},loading:function(e){t.layout.showLoader=e}}}),a("settings",{attrs:{db:t.db},on:{"switch-mode":function(e){return t.switchMode(e)},save:function(e){t.prompt=e}}})],1)},s=[],i={methods:{$_genUID(){return Math.random().toString(36).slice(-8)},$_getHostname(){let t="";return t},$_cssVar(t){return getComputedStyle(document.documentElement).getPropertyValue(t).trimStart()},$_scaffoldDB(){return{default:{name:"Default",knobs:[{id:"wn0gbd99",name:"Samsung Volume Up",mqtt:'{"Protocol":"SAMSUNG","Bits":32,"Data":"0xE0E0E01F"}',icon:"up-arrow",topic_send:"irur/cmnd/IRsend",isPlaceholder:!1},{id:"wt9u3yzj",name:"Samsung Volume Down",mqtt:'{"Protocol":"SAMSUNG","Bits":32,"Data":"0xE0E0D02F"}',icon:"down-arrow",topic_send:"irur/cmnd/IRsend",isPlaceholder:!1}]}}}}},r=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{attrs:{id:"svg-sprite"}})},c=[],d={data(){return{glyphs:[]}},mounted(){this.load()},methods:{load(){const t=fetch("icons/sprite.svg");t.then(t=>{if(!t.ok)throw new Error("API HTTP status "+t.status);return t.text()}).then(t=>{this.parse(t)}).catch(t=>{this.$toast.error(String(t))})},parse(t){const e=document.getElementById("svg-sprite"),a=(new DOMParser).parseFromString(t,"text/xml"),n=a.getElementsByTagName("symbol");if(!n.length)throw new Error("Cannot generate svg icons");e.innerHTML=t;for(let o=0;o<n.length;o+=1)this.glyphs.push(n[o].getAttribute("id"));this.$emit("loaded",this.glyphs)}}},l=d,u=(a("fc63"),a("2877")),m=Object(u["a"])(l,r,c,!1,null,null,null),h=m.exports,v=function(){var t=this,e=t.$createElement,a=t._self._c||e;return t.isActive?a("a",{attrs:{href:"#",id:"undo"},on:{keydown:function(e){return(e.type.indexOf("key")||90===e.keyCode)&&e.ctrlKey?t.undo(e):null},click:function(e){return t.back()}}},[a("span",[t._v("Undo")]),a("svg",[a("use",{attrs:{"xlink:href":"#fast-forward"}})])]):t._e()},f=[];const p=5e3;var b={props:{db:{type:Object,required:!0}},data(){return{dbHistory:null,isActive:!1}},watch:{isActive(){this.isActive?window.addEventListener("keydown",this.keyDown):window.removeEventListener("keydown",this.keyDown)}},methods:{back(){this.$emit("back",this.dbHistory),this.isActive=!1},record(){this.dbHistory=JSON.parse(JSON.stringify(this.db)),this.timer(),this.isActive=!0},timer(){setTimeout(()=>{this.isActive=!1},p)},keyDown(t){"Enter"===t.key&&(this.back(),this.isActive=!1)}}},k=b,y=(a("0ddd"),Object(u["a"])(k,v,f,!1,null,null,null)),g=y.exports,w=function(){var t=this,e=t.$createElement,a=t._self._c||e;return t.isActive?a("form",{class:{disabled:t.knobSaveData.isPlaceholder},attrs:{action:"#",id:"editor",autocomplete:"off"},on:{submit:function(e){return t.validate()},keydown:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"esc",27,e.key,["Esc","Escape"])?null:t.closeModal()}}},[a("div",{staticClass:"close",on:{click:function(e){return t.closeModal()}}},[a("svg",[a("use",{attrs:{"xlink:href":"#close"}})])]),t._m(0),a("input",{directives:[{name:"model",rawName:"v-model",value:t.knobSaveData.name,expression:"knobSaveData.name"}],ref:"editorNameField",attrs:{type:"text",id:"knob_name",required:""},domProps:{value:t.knobSaveData.name},on:{input:function(e){e.target.composing||t.$set(t.knobSaveData,"name",e.target.value)}}}),t._m(1),a("div",{attrs:{id:"mqtt"}},[a("input",{directives:[{name:"model",rawName:"v-model",value:t.knobSaveData.mqtt,expression:"knobSaveData.mqtt"}],attrs:{type:"text",id:"knob_mqtt",required:""},domProps:{value:t.knobSaveData.mqtt},on:{input:function(e){e.target.composing||t.$set(t.knobSaveData,"mqtt",e.target.value)}}}),a("button",{attrs:{type:"button"},on:{click:function(e){return e.preventDefault(),t.recordIR()}}},[t._v("Listen")])]),t._m(2),a("div",{attrs:{id:"knob_mqtt_topic"}},t._l(t.settings.topic_send,(function(e,n){return a("p",{key:n},[a("input",{directives:[{name:"model",rawName:"v-model",value:t.knobSaveData.topic_send,expression:"knobSaveData.topic_send"}],ref:"mqtt-checkbox-"+n,refInFor:!0,attrs:{type:"radio",required:"",id:"mqtt-label-"+n},domProps:{value:e,checked:t._q(t.knobSaveData.topic_send,e)},on:{change:function(a){return t.$set(t.knobSaveData,"topic_send",e)}}}),a("label",{attrs:{for:"mqtt-label-"+n}},[t._v(t._s(e))])])})),0),a("label",{attrs:{for:"knob_id"}},[t._v("Unique id "),a("span",{staticClass:"mono"},[t._v(" $ curl "+t._s(t.settings.hostname)+t._s(t.settings.api.send)+t._s(t.knobSaveData.id)+"/ ")])]),a("input",{directives:[{name:"model",rawName:"v-model",value:t.knobSaveData.id,expression:"knobSaveData.id"}],attrs:{type:"text",id:"knob_id",required:"",readonly:""},domProps:{value:t.knobSaveData.id},on:{input:function(e){e.target.composing||t.$set(t.knobSaveData,"id",e.target.value)}}}),t._m(3),a("input",{directives:[{name:"model",rawName:"v-model",value:t.knobSaveData.icon,expression:"knobSaveData.icon"}],ref:"icon",attrs:{type:"text",id:"knob_icon"},domProps:{value:t.knobSaveData.icon},on:{input:function(e){e.target.composing||t.$set(t.knobSaveData,"icon",e.target.value)}}}),a("div",{attrs:{id:"glyphs"}},t._l(t.filteredIcons,(function(e){return a("div",{key:e,staticClass:"glyph",attrs:{title:e},domProps:{innerHTML:t._s(t.renderIcon(e))},on:{click:function(a){t.knobSaveData.icon=e,t.$refs.icon.focus()}}})})),0),t._m(4),a("div",{staticClass:"color_picker clearfix"},[a("input",{directives:[{name:"model",rawName:"v-model",value:t.colorPicker,expression:"colorPicker"}],attrs:{type:"color",value:"#000000"},domProps:{value:t.colorPicker},on:{input:function(e){e.target.composing||(t.colorPicker=e.target.value)}}}),a("input",{directives:[{name:"model",rawName:"v-model",value:t.knobSaveData.color,expression:"knobSaveData.color"}],attrs:{id:"color_picker",type:"text",maxlength:"7"},domProps:{value:t.knobSaveData.color},on:{keyup:function(e){return t.syncColorPicker()},input:function(e){e.target.composing||t.$set(t.knobSaveData,"color",e.target.value)}}})]),a("div",{staticClass:"placeholder"},[a("input",{directives:[{name:"model",rawName:"v-model",value:t.knobSaveData.isPlaceholder,expression:"knobSaveData.isPlaceholder"}],ref:"knobType",attrs:{type:"checkbox",id:"knob-type"},domProps:{checked:Array.isArray(t.knobSaveData.isPlaceholder)?t._i(t.knobSaveData.isPlaceholder,null)>-1:t.knobSaveData.isPlaceholder},on:{change:function(e){var a=t.knobSaveData.isPlaceholder,n=e.target,o=!!n.checked;if(Array.isArray(a)){var s=null,i=t._i(a,s);n.checked?i<0&&t.$set(t.knobSaveData,"isPlaceholder",a.concat([s])):i>-1&&t.$set(t.knobSaveData,"isPlaceholder",a.slice(0,i).concat(a.slice(i+1)))}else t.$set(t.knobSaveData,"isPlaceholder",o)}}}),a("label",{attrs:{for:"knob-type"}},[t._v("Use as an empty placeholder")])]),a("button",{attrs:{form:"editor"},on:{click:function(e){return e.preventDefault(),t.validate()}}},[t._v("Save")])]):t._e()},_=[function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("label",{attrs:{for:"knob_name"}},[t._v("Name "),a("span",[t._v("Name for the knob")])])},function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("label",{attrs:{for:"knob_mqtt"}},[t._v("MQTT response "),a("span",[t._v("Tap listen and press a remote button towards IR receiver")])])},function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("label",{attrs:{for:"knob_mqtt_topic"}},[t._v("MQTT topic "),a("span",[t._v("Add new topics from HA configuration")])])},function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("label",{attrs:{for:"knob_icon"}},[t._v("Icon "),a("span",[t._v("If no icon is selected, the name is being used")])])},function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("label",{attrs:{for:"color_picker"}},[t._v("Color "),a("span",[t._v("Colorpicker for the icon. Leave blank for default that depends on the parent theme.")])])}],$=a("2ef0"),D=a.n($),S={mixins:[i],components:{},props:{db:{type:Object,required:!0},layout:{type:Object,required:!0},settings:{type:Object,required:!0}},data(){return{knobSaveData:{isPlaceholder:"",id:"",name:"",mqtt:"",topic_send:"",icon:"",color:""},icons:[],colorPicker:"#ffffff",isActive:!1}},computed:{filteredIcons(){return this.layout.icons.filter(t=>t.toLowerCase().indexOf(this.knobSaveData.icon.toLowerCase())>-1)}},watch:{colorPicker:D.a.throttle((function(t){this.knobSaveData.color=t}),400)},methods:{save(){this.$emit("edit",this.knobSaveData)},add(){this.isActive=!0,this.$emit("switch-mode",{mode:"add"}),this.colorPicker="",this.knobSaveData={isPlaceholder:!1,id:this.$_genUID(),name:"",mqtt:"",icon:"",color:"",topic_send:this.settings.topic_send[0]},this.$nextTick().then(()=>{this.$refs.editorNameField.focus()})},edit(t){this.isActive=!0,this.$emit("switch-mode",{mode:"edit"});const e=this.db[this.layout.activeTab].knobs,a=e.findIndex(e=>e.id===t);this.knobSaveData=JSON.parse(JSON.stringify(e[a])),this.colorPicker=this.knobSaveData.color,this.$nextTick().then(()=>{this.$refs.editorNameField.focus()})},recordIR(){const t=this;this.$emit("loading",!0);const e=5,a=new AbortController,n=setTimeout(()=>{a.abort()},1e3*e);function o(){t.$emit("loading",!1),clearTimeout(n)}fetch(`${this.settings.api.prefix}${this.settings.api.receive}`,{signal:a.signal}).then(t=>{if(!t.ok)throw new Error("API HTTP status "+t.status);return t.json()}).then(e=>{o(),t.knobSaveData.mqtt=e.irCode,this.$toast.info("Ir code received")}).catch(t=>{o(),"AbortError"===t.name?this.$toast.info(`Stopped listening after ${e} seconds of no incoming messages`):this.$toast.error(String(t))})},validate(){const t=this.knobSaveData,e=[t.name,t.mqtt,t.id,t.topic_send];this.knobSaveData.color=this.convertHex(t.color),!t.isPlaceholder&&e.some(t=>""===t||void 0===t)?this.$toast.error("Name, id, mqtt and topic required"):this.save()},renderIcon(t){return`<svg class="icon" style="fill: ${this.knobSaveData.color}">\n                <use xlink:href="#${t}"></use>\n              </svg>`},syncColorPicker(){const t=this.knobSaveData.color;t.startsWith("#")&&7===t.length&&(this.colorPicker=t)},convertHex(t){return t.startsWith("#")&&4===t.length?(t=t.substring(1).split("").map((function(t){return t+t})).join(""),"#"+t):t},closeModal(){this.$emit("switch-mode",{mode:"normal"}),this.isActive=!1}}},x=S,P=(a("58d3"),Object(u["a"])(x,w,_,!1,null,null,null)),T=P.exports,E=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{attrs:{id:"tabs"}},[a("vue-context",{ref:"menu",scopedSlots:t._u([{key:"default",fn:function(e){return[a("li",[a("a",{attrs:{"data-name":"add"},on:{click:function(a){return a.preventDefault(),t.menu(a,e.data)}}},[t._v("Add")])]),a("li",[a("a",{attrs:{"data-name":"rename"},on:{click:function(a){return a.preventDefault(),t.menu(a,e.data)}}},[t._v("Rename")])]),a("li",["default"!==e.data?a("a",{attrs:{"data-name":"remove"},on:{click:function(a){return a.preventDefault(),t.menu(a,e.data)}}},[t._v("Remove")]):t._e()])]}}])}),t._l(t.db,(function(e,n){return a("div",{key:n,staticClass:"tab",class:{active:t.layout.activeTab===n},attrs:{"data-id":n},on:{contextmenu:function(e){return e.preventDefault(),t.$refs.menu.open(e,n)},click:function(e){return t.switchTab(n)}}},["tab-rename"===t.layout.mode&&t.layout.activeTab===n?a("input",{directives:[{name:"model",rawName:"v-model",value:t.tabSaveData.name,expression:"tabSaveData.name"}],ref:"tab-"+n,refInFor:!0,attrs:{type:"text"},domProps:{value:t.tabSaveData.name},on:{blur:function(e){return t.saveTab()},focus:function(a){t.tabSaveData.name=e.name},keyup:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:e.target.blur()},input:function(e){e.target.composing||t.$set(t.tabSaveData,"name",e.target.value)}}}):a("span",[t._v(" "+t._s(e.name)+" ")])])}))],2)},C=[],O=a("899b"),A={mixins:[i],components:{VueContext:O["a"]},props:{db:{type:Object,required:!0},layout:{type:Object,required:!0}},data(){return{tabSaveData:{id:"",name:""}}},methods:{switchTab(t){this.$emit("switch-tab",t)},saveTab(){this.$emit("save",{data:this.tabSaveData}),this.$emit("switch-mode",{mode:"normal"})},addTab(){const t=this.$_genUID();this.tabSaveData={name:"New",id:t},this.$emit("save",{data:this.tabSaveData,mode:"tab-rename"}),this.renameTab(t)},renameTab(t){this.tabSaveData.id=t,this.$emit("switch-tab",t),this.$emit("switch-mode",{mode:"tab-rename"}),this.$nextTick().then(()=>{this.$refs["tab-"+t][0].focus()})},removeTab(t){this.$emit("remove",{message:`Are you sure you want to delete tab named “${this.db[t].name}”?`,callback:"removeTab",data:t})},menu(t,e){switch(t.target.dataset.name){case"add":this.addTab();break;case"rename":this.renameTab(e);break;case"remove":this.removeTab(e);break}}}},j=A,q=(a("6f10"),Object(u["a"])(j,E,C,!1,null,null,null)),M=q.exports,I=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{attrs:{id:"remote"}},[a("vue-context",{ref:"menu",scopedSlots:t._u([{key:"default",fn:function(e){return[a("li",[a("a",{attrs:{href:"#","data-name":"add"},on:{click:function(a){return a.preventDefault(),t.menu(a,e.data)}}},[t._v("Add")])]),a("li",[a("a",{attrs:{href:"#","data-name":"edit"},on:{click:function(a){return a.preventDefault(),t.menu(a,e.data)}}},[t._v("Edit")])]),a("li",[a("a",{attrs:{href:"#","data-name":"sort"},on:{click:function(a){return a.preventDefault(),t.menu(a,e.data)}}},[t._v("Sort")])]),a("li",[a("a",{attrs:{href:"#","data-name":"remove"},on:{click:function(a){return a.preventDefault(),t.menu(a,e.data)}}},[t._v("Remove")])])]}}])}),a("draggable",{attrs:{id:"draggable",draggable:".knob",disabled:"sort"!=this.layout.mode},on:{change:function(e){return t.$emit("sort")}},model:{value:t.filteredDB,callback:function(e){t.filteredDB=e},expression:"filteredDB"}},[a("div",{staticClass:"knob add-item",attrs:{slot:"footer",draggable:"false"},on:{click:function(e){return t.addKnob()}},slot:"footer"},[a("div",{staticClass:"glyph"},[a("svg",[a("use",{attrs:{"xlink:href":"#add"}})])])]),t._l(t.filteredDB,(function(e,n){return a("div",{key:e.id,staticClass:"knob",attrs:{title:!e.isPlaceholder&&e.name,"data-id":e.id,"data-placeholder":e.isPlaceholder||!1},on:{click:function(a){return t.sendIr(e.id,e.isPlaceholder)},contextmenu:function(a){return a.preventDefault(),t.$refs.menu.open(a,{id:e.id,name:e.name||"placeholder",index:n})}}},[e.icon?a("div",{staticClass:"glyph"},[a("svg",{style:"fill: "+e.color+";"},[a("use",{attrs:{"xlink:href":"#"+e.icon}})])]):a("div",{class:"no-icon len-"+e.name.length,style:"color: "+e.color+";"},[t._v(" "+t._s(e.name)+" ")])])}))],2)],1)},N=[],L=a("310e"),B=a.n(L),H={components:{draggable:B.a,VueContext:O["a"]},props:{db:{type:Object,required:!0},layout:{type:Object,required:!0},settings:{type:Object,required:!0}},watch:{db(){this.data=this.db}},data(){return{data:{default:{name:"Default",knobs:[]}}}},computed:{filteredDB:{get(){return this.data[this.layout.activeTab].knobs},set(t){this.data[this.layout.activeTab].knobs=t}}},methods:{menu(t,e){const a=t.target.dataset.name;switch(a){case"add":this.addKnob();break;case"edit":this.editKnob(e.id);break;case"sort":this.$emit("switch-mode",{mode:"sort"});break;case"remove":this.$emit("remove",{message:`Are you sure you want to delete knob named “${e.name}”?`,callback:"removeKnob",data:e.id});break}},addKnob(){this.$emit("editor",{mode:"add",id:null})},editKnob(t){this.$emit("editor",{mode:"edit",id:t})},sendIr(t,e){if(!e||void 0===e){const e=this.settings.api.prefix;fetch(`${e}${this.settings.api.send}${t}/`).then(t=>{if(!t.ok)throw new Error("API HTTP status "+t.status)}).then(()=>{this.loader=!1}).catch(t=>{this.$toast.error(String(t)),this.loader=!1})}}}},U=H,R=(a("6b37"),Object(u["a"])(U,I,N,!1,null,null,null)),K=R.exports,J=function(){var t=this,e=t.$createElement,a=t._self._c||e;return t.isActive?a("div",{staticClass:"container"},[a("div",{attrs:{id:"prompt"}},[a("div",{staticClass:"close",on:{click:function(e){return t.cancel()}}},[a("svg",[a("use",{attrs:{"xlink:href":"#close"}})])]),a("div",{staticClass:"message"},[t._v(" "+t._s(t.data.message)+" ")]),a("div",{staticClass:"clearfix"},[a("button",{staticClass:"confirm",attrs:{type:"button"},on:{click:function(e){return e.preventDefault(),t.confirm()}}},[t._v(" Yes ")]),a("button",{staticClass:"secondary",attrs:{type:"button"},on:{click:function(e){return e.preventDefault(),t.cancel()}}},[t._v(" Cancel ")])])])]):t._e()},F=[],V={props:{params:{type:Object,required:!0}},computed:{data(){return this.params},isActive(){return this.data.callback&&null!==this.data.message}},watch:{isActive(){this.isActive?(this.$emit("switch-mode",{mode:"prompt"}),window.addEventListener("keydown",this.keyDown)):window.removeEventListener("keydown",this.keyDown)}},methods:{confirm(){this.closeModal(),this.$emit("callback",!0)},cancel(){this.closeModal(),this.$emit("callback",!1)},keyDown(t){"Enter"===t.key&&this.confirm(),"Escape"===t.key&&this.cancel()},closeModal(){this.$emit("switch-mode",{mode:"normal"})}}},G=V,Q=(a("97ce"),Object(u["a"])(G,J,F,!1,null,null,null)),W=Q.exports,z=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{attrs:{id:"settings"}},[a("div",{staticClass:"btn",on:{click:function(e){return e.preventDefault(),t.show()}}},[a("svg",[a("use",{attrs:{"xlink:href":"#gear-2"}})])]),t.isActive?a("div",{staticClass:"window"},[a("div",{staticClass:"close",on:{click:function(e){return t.closeModal()}}},[a("svg",[a("use",{attrs:{"xlink:href":"#close"}})])]),a("textarea",{directives:[{name:"model",rawName:"v-model",value:t.data,expression:"data"}],ref:"data",domProps:{value:t.data},on:{input:function(e){e.target.composing||(t.data=e.target.value)}}}),t._v(" "),a("button",{staticClass:"copy secondary",on:{click:function(e){return t.copyToClipboard()}}},[t._v(" Copy ")]),a("button",{staticClass:"export",on:{click:function(e){return t.dataExport()}}},[t._v("Export")]),a("button",{staticClass:"save",on:{click:function(e){return t.save()}}},[t._v("Save")])]):t._e()])},Y=[],X=(a("ddb0"),a("2b3d"),{data(){return{isActive:!1,data:{}}},props:{db:{type:Object,required:!0}},watch:{isActive(){this.isActive?window.addEventListener("keydown",this.keyDown):window.removeEventListener("keydown",this.keyDown)}},methods:{show(){this.isActive=!0,this.$emit("switch-mode",{mode:"settings"}),this.data=JSON.stringify(this.db,null,2)},save(){this.$emit("save",{message:"Are you sure you want to save the changes? This will overwrite your current database.",callback:"saveDBManualEdit",data:this.data}),this.closeModal()},dataExport(){try{const t=JSON.stringify(this.db,null,2),e=new Blob([t],{type:"octet/stream"}),a=window.URL.createObjectURL(e),n=document.createElement("a");document.body.appendChild(n),n.style="display: none;",n.href=a,n.download="irur_backup.txt",n.click(),window.URL.revokeObjectURL(a),this.$toast.success("Export successful, check your downloads folder")}catch(t){this.$toast.success("Cannot export file: "+t.message)}},copyToClipboard(){this.$refs.data.focus(),this.$refs.data.select(),document.execCommand("copy")},closeModal(){this.isActive=!1,this.$emit("switch-mode",{mode:"normal"})},keyDown(t){"Escape"===t.key&&this.closeModal()}}}),Z=X,tt=(a("d382"),Object(u["a"])(Z,z,Y,!1,null,null,null)),et=tt.exports,at=(a("a89b"),{name:"App",components:{SvgSprite:h,Undo:g,Editor:T,Tabs:M,Remote:K,Prompt:W,Settings:et},mixins:[i],data(){return{layout:{mode:"normal",showLoader:!0,showUndo:!1,activeTab:"default",icons:[]},settings:{api:{prefix:this.$_getHostname()+"api/",receive:"ir/receive/",send:"ir/send/",save:"db/save/",load:"db/load/",settings:"settings/"},hostname:"",topic_send:[]},db:{default:{name:"Default",knobs:[]}},prompt:{message:null,data:null,callback:null}}},watch:{layout:{handler(t){"normal"===t.mode||"sort"===t.mode?window.addEventListener("keydown",this.keyDown):window.removeEventListener("keydown",this.keyDown)},deep:!0}},mounted(){this.loadTheme(),this.loadDatabase(),this.loadSettings()},methods:{loadTheme(){const t=t=>{const e=window.top.document.documentElement;return getComputedStyle(e).getPropertyValue("--"+t)},e=e=>{let a="";for(let n=0;n<e.length;n+=1)if(""!==t(e[n])){a=t(e[n]);break}return a},a=document.documentElement;a.style.setProperty("--accent",e(["primary-text-color","text-color"])),a.style.setProperty("--background",e(["primary-background-color","background-color"])),a.style.setProperty("--background-shade",e(["card-background-color"]))},loadDatabase(){const t=this.settings.api.prefix,e=fetch(`${t}${this.settings.api.load}`);e.then(t=>{if(!t.ok)throw new Error("API HTTP status "+t.status);return t.json()}).then(t=>{"error"===t.status?(this.db=this.$_scaffoldDB(),this.sync()):(this.db=t,this.layout.showLoader=!1)}).catch(t=>{this.$toast.error(String(t))})},loadSettings(){const t=this.settings.api.prefix,e=fetch(`${t}${this.settings.api.settings}`);e.then(t=>{if(!t.ok)throw new Error("API HTTP status "+t.status);return t.json()}).then(t=>{this.settings.hostname=t.hostname,this.settings.topic_send=t.topic_send}).catch(t=>{this.$toast.error(String(t))})},showEditor(t){const{mode:e,id:a}=t;switch(e){case"add":this.$refs.editor.add();break;case"edit":this.$refs.editor.edit(a);break}},switchMode(t){this.layout.mode=t.mode,"normal"===this.layout.mode&&(this.loader=!1)},sync(t="normal"){const e=this.settings.api.prefix,a=fetch(`${e}${this.settings.api.save}`,{headers:{Accept:"application/json","Content-Type":"application/json"},method:"POST",body:JSON.stringify(this.db)});a.then(e=>{if(this.layout.mode=t,!e.ok)throw new Error("API HTTP status "+e.status)}).catch(t=>{this.$toast.error(String(t))})},editKnob(t){const e=this.db[this.layout.activeTab].knobs,a=e.findIndex(e=>e.id===t.id);-1==a?e.push(t):e[a]=t,this.sync("normal")},removeKnob(t){const e=this.db[this.layout.activeTab].knobs,a=e.findIndex(e=>e.id===t);this.$refs.undo.record(),this.$delete(e,a),this.sync()},saveTab(t){const{id:e,name:a}=t.data;!{}.hasOwnProperty.call(this.db,e)?this.db={...this.db,[e]:{name:a,knobs:[]}}:this.db[e].name=a,this.sync(t.mode)},removeTab(t){t===this.layout.activeTab&&(this.layout.activeTab="default"),this.$refs.undo.record(),this.$delete(this.db,t),this.sync()},saveDBManualEdit(t){this.$refs.undo.record();const e=JSON.parse(t);try{if(!{}.hasOwnProperty.call(e,"default"))throw new Error("Invalid json or missing 'default' property");this.db=e,this.sync(),this.$toast.success("Changes saved successfully")}catch(a){this.$toast.error("Cannot save the changes: "+a.message)}},resetDB(){this.db=this.$_scaffoldDB(),this.sync()},promptCallback(t){const{callback:e,data:a}=this.prompt;t&&e&&this[e](a),Object.keys(this.prompt).forEach(t=>{this.prompt[t]=void 0})},keyDown(t){"N"===t.key&&this.$refs.remote.addKnob(),"T"===t.key&&this.$refs.tabs.addTab(),"Escape"===t.key&&"sort"===this.layout.mode&&this.switchMode({mode:"normal"})}}}),nt=at,ot=Object(u["a"])(nt,o,s,!1,null,null,null),st=ot.exports,it=a("b079"),rt=a.n(it);n["default"].use(rt.a,{position:"bottom"}),n["default"].config.productionTip=!1,new n["default"]({render:t=>t(st)}).$mount("#app")},"58d3":function(t,e,a){"use strict";var n=a("f08e"),o=a.n(n);o.a},"5bf7":function(t,e,a){},"6b37":function(t,e,a){"use strict";var n=a("5bf7"),o=a.n(n);o.a},"6f10":function(t,e,a){"use strict";var n=a("75aa"),o=a.n(n);o.a},"75aa":function(t,e,a){},"8bf4":function(t,e,a){},"97ce":function(t,e,a){"use strict";var n=a("c965"),o=a.n(n);o.a},a89b:function(t,e,a){},c08c:function(t,e,a){},c965:function(t,e,a){},d382:function(t,e,a){"use strict";var n=a("c08c"),o=a.n(n);o.a},f08e:function(t,e,a){},fc63:function(t,e,a){"use strict";var n=a("115d"),o=a.n(n);o.a}});
//# sourceMappingURL=app.45c76767.js.map