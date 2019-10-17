var Consul = {
    name: 'consul',
    template: `
      <li @click.stop="toggle" id="{{tree.P}}">
        <div :class=tree.T>{{tree.K}} <span v-if="tree.Ks && tree.Ks.length === 0">[{{tree.P}}] <button @click.stop="edit">{{editBtn}}</button><button @click.stop="save">save</button><button>delete</button></span></div>
        <div v-show="!isEdit" class="vdiv" v-if="tree.Ks && tree.Ks.length === 0" v-text="kvp[tree.P]"></div>
        <div class="clearfix"></div>
        <textarea v-show="isEdit" class="vtext" v-if="tree.Ks && tree.Ks.length === 0" v-model="kvp[tree.P]"></textarea>
        <ul v-show="open" v-if="tree.Ks && tree.Ks.length > 0">
          <consul v-for="(node, index) in tree.Ks" :tree="node" :key="index" :kvp="kvp"></consul>
        </ul>
      </li>
    `,
    props: {
        tree: Object,
        kvp: Object
    },
    data() {
        return {
            editBtn: "edit",
            isEdit: false,
            open: false
        }
    },
    methods: {
        toggle(){
            if(this.tree.Ks && this.tree.Ks.length > 0){
                this.open = !this.open
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
            ajax('put', '/api/setkv?k=' + this.tree.P, this.kvp[this.tree.P],
                function(e){
                    app.$data.tree = JSON.parse(e.target.responseText);
                    console.log(app.$data.tree)
                });
        }
    }
}

var app = new Vue({
    el: '#main',
    components: {
        'consul': Consul
    },
    data: {
        tree: {}
    },
    methods: {
        getKVTree: function(){
            ajax('get', '/api/kvtree', "",
                    function(e){
                        app.$data.tree = JSON.parse(e.target.responseText);
                        console.log(app.$data.tree)
                    });
        },
        openAll: function(){
            var uls = document.querySelectorAll("ul");
            for (var i = 0; i < uls.length; i++) {
                uls[i].style.display = "block";
            }
        }
    },
    mounted(){
        this.getKVTree()
    },
})

function ajax(method, url, data, func){
    const oReq = new XMLHttpRequest();
    oReq.onload = func
    oReq.onerror = function(err){
        console.log('Ajax Error :', err)
    }
    oReq.open(method, url, true)
    oReq.send(data)
}
