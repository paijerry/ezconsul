var Consul = {
    name: 'consul',
    template: `
      <li @click.stop="toggle" :id="tree.P">
        <div :class=tree.T  @click.stop="toggleV">{{tree.K}} <span v-if="tree.Ks && tree.Ks.length === 0">[{{tree.P}}]</span></div>
        <div class="vwrap" v-if="tree.Ks && tree.Ks.length === 0">
            <div v-show="!isEdit" class="vdiv" v-if="tree.Ks && tree.Ks.length === 0" v-html="kvp[tree.P]"></div>
            <textarea v-show="isEdit" class="vtext" v-if="tree.Ks && tree.Ks.length === 0" v-model="kvpafter[tree.P]"></textarea>
            <button @click.stop="edit">{{editBtn}}</button><button @click.stop="save">save</button>
            <div class="clearfix"></div>
        </div>
        <ul class="innerul" v-show="open" v-if="tree.Ks && tree.Ks.length > 0">
          <consul v-for="(node, index) in tree.Ks" :tree="node" :key="index" :kvp="kvp" :kvpafter="kvpafter" :kvpbefore="kvpbefore"></consul>
        </ul>
      </li>
    `,
    props: {
        tree: Object,
        kvp: Object,
        kvpafter: Object,
        kvpbefore: Object
    },
    data() {
        return {
            editBtn: "edit",
            isEdit: false,
            open: false,
            openV: false
        }
    },
    methods: {
        toggle(e){
            if(this.tree.Ks && this.tree.Ks.length > 0){
                this.open = !this.open
            }
        },
        toggleV(e){
            if(this.tree.Ks && this.tree.Ks.length <= 0){
                console.log(e.currentTarget.parentNode.querySelector(".vwrap"));
                if (e.currentTarget.parentNode.querySelector(".vwrap").style.display === "block"){
                    e.currentTarget.parentNode.querySelector(".vwrap").style.display = "none";
                } else {
                    e.currentTarget.parentNode.querySelector(".vwrap").style.display = "block";
                }
            }
        },
        edit(){
            this.isEdit = !this.isEdit
            if (this.isEdit) {
                this.editBtn = "editing"
                return
            }
            this.editBtn = "edit"
        },
        save(){
            let self = this;
            ajax('put', '/api/setkv?k=' + self.tree.P, self.kvpafter[self.tree.P],
                function(e){
                    if (e.target.status !== 200) {
                        app.pushMsg(self.tree.P+ " update failed.", "failed");
                    } else {
                        app.pushMsg(self.tree.P + " update success.");
                        self.kvp[self.tree.P] = self.kvpafter[self.tree.P];
                        self.kvpbefore[self.tree.P] = self.kvpafter[self.tree.P];
                        self.edit();
                    }
                });
        },
        reset(){
            self.kvp[self.tree.P] = self.kvpbefore[self.tree.P];
        }
    }
}

var app = new Vue({
    el: '#main',
    components: {
        'consul': Consul
    },
    data: {
        address: "",
        searchText: "1324",
        replaceText: "",
        result: {},
        resultBefore: {},
        resultAfter: {},
        replaceKeys: [],
        msgQue:[]
    },
    methods: {
        getKVTree: function(callback){
            ajax('get', '/api/kvtree', "",
                function(e){
                    // console.log(e.target.getAllResponseHeaders().toLowerCase());
                    app.$data.address = e.target.getResponseHeader("address");
                    app.$data.result = JSON.parse(e.target.responseText);
                    app.$data.resultAfter = JSON.parse(e.target.responseText);
                    app.$data.resultBefore = JSON.parse(e.target.responseText);
                    app.$data.replaceKeys = []
                    // console.log(app.$data.resultBefore)
                    // console.log(app.$data.resultAfter)

                    if (typeof callback === "function") {
                        callback();
                    }
                    // console.log(app.$data.result)
                });
        },
        setAddress: function(){
            ajax('put', '/api/setaddress', app.$data.address,
                function(e){
                    if (e.target.status !== 200) {
                        app.pushMsg("address: " + app.$data.address + " update failed.", "failed");
                    } else {
                        app.pushMsg("address: " + app.$data.address + " update success.");
                    }

                    app.getKVTree();
                });
            return
        },
        openAll: function(){
            var uls = document.querySelectorAll(".innerul, .vwrap");
            for (var i = 0; i < uls.length; i++) {
                uls[i].style.display = "block";
            }
            // var vwrap = document.querySelectorAll(".vwrap");
            // for (var i = 0; i < vwrap.length; i++) {
            //     vwrap[i].style.display = "block";
            // }
        },
        closeAll: function(){
            var uls = document.querySelectorAll(".innerul, .vwrap");
            for (var i = 0; i < uls.length; i++) {
                uls[i].style.display = "none";
            }
            // var vwrap = document.querySelectorAll(".vwrap");
            // for (var i = 0; i < vwrap.length; i++) {
            //     vwrap[i].style.display = "none";
            // }
        },
        search: function(){
            app.$data.result = JSON.parse(JSON.stringify(app.$data.resultBefore));
            this.closeAll()
            for(var k in app.$data.resultBefore.KVP){
                var v = app.$data.resultBefore.KVP[k]
                if (v.indexOf(app.$data.searchText) !== -1){
                    // console.log(k, document.getElementById(k))
                    document.getElementById(k).style.display = "block";
                    document.getElementById(k).querySelector(".vwrap").style.display = "block";
                    var doms = document.querySelectorAll(".innerul") 
                    for (let i = 0; i < doms.length; i++) {
                        if (doms[i].innerHTML.indexOf(k) !== -1) {
                            doms[i].style.display = "block";
                        }
                    }
                    
                    app.$data.result.KVP[k] = this.replaceTmp(app.$data.searchText, '<span class="search-text">'+app.$data.searchText+'</span>', v);
                }
            }
        },
        replace() {
            app.$data.result = JSON.parse(JSON.stringify(app.$data.resultBefore));
            app.$data.resultAfter = JSON.parse(JSON.stringify(app.$data.resultBefore));
            app.$data.replaceKeys = [];
            this.closeAll()
            for(var k in app.$data.resultBefore.KVP){
                var v = app.$data.resultBefore.KVP[k]
                if (v.indexOf(app.$data.searchText) !== -1){
                    // console.log(k, document.getElementById(k))
                    document.getElementById(k).style.display = "block";
                    
                    var doms = document.querySelectorAll(".innerul") 
                    for (let i = 0; i < doms.length; i++) {
                        if (doms[i].innerHTML.indexOf(k) !== -1) {
                            doms[i].style.display = "block";
                        }
                    }

                    app.$data.result.KVP[k] = this.replaceTmp(app.$data.searchText, '<span class="delete-text">'+app.$data.searchText+'</span><span class="replace-text">'+app.$data.replaceText+'</span>', v);
                    app.$data.resultAfter.KVP[k] = this.replaceTmp(app.$data.searchText, app.$data.replaceText, v);
                    app.$data.replaceKeys.push(k);
                }
            }
        },
        replaceTmp(t, r, s) {
            var re = new RegExp(t,"g");
            rs = s.replace(re, r);
            return rs;
        },
        replaceSave() {
            if (!this.doubleCheck("Are you sure?")){
                return
            }
            // console.log(app.$data.replaceKeys);
            let replaceCount = app.$data.replaceKeys.length;
            for (let i = 0; i < app.$data.replaceKeys.length; i++) {
                // console.log(app.$data.replaceKeys[i])
                ajax('put', '/api/setkv?k=' + app.$data.replaceKeys[i], app.$data.resultAfter.KVP[app.$data.replaceKeys[i]],
                    function(e){
                        if (e.target.status !== 200) {
                            app.pushMsg(app.$data.replaceKeys[i] + " update failed.", "failed");
                        } else {
                            app.pushMsg(app.$data.replaceKeys[i] + " update success.");
                        }

                        replaceCount--;
                        if (replaceCount <= 0) {
                            app.getKVTree(function(){
                                app.$data.searchText = app.$data.replaceText;
                                app.$data.replaceText = "";
                                app.search();
                                app.pushMsg("Update finished.");
                            });
                        };
                    });
            }
        },
        doubleCheck(msg){
            let r = confirm(msg);
                if (r==true){
                    return true;
                }
                return false;
        },
        pushMsg: function(msg, status){
            if (status===undefined){
                status = "success";
            }
            app.$data.msgQue.push({
                "msg": msg,
                "status": status
            });

            setTimeout(function(){
                app.$data.msgQue.shift();
            }, 6000);
        }
    },
    mounted(){
        this.getKVTree(function(){
            app.pushMsg("Welcome");
        })
    }
});

function ajax(method, url, data, func){
    const oReq = new XMLHttpRequest();
    oReq.onload = func
    oReq.onerror = function(err){
        console.log('Ajax Error :', err)
    }
    oReq.open(method, url, true)
    oReq.send(data)
}
