var Consul = {
    name: 'consul',
    template: `
      <li @click.stop="toggle">
        <div :class=tree.T>{{tree.K}} <span v-if="tree.Ks && tree.Ks.length === 0">[{{tree.P}}]</span></div>
        <textarea @click.stop="toggle" class="vtext" v-if="tree.Ks && tree.Ks.length === 0">{{tree.V}}</textarea>
        <ul v-show="open" v-if="tree.Ks && tree.Ks.length > 0">
          <consul v-for="(node, index) in tree.Ks" :tree="node" :key="index" ></consul>
        </ul>
      </li>
    `,
    props: {
        tree: Object
    },
    data() {
        return {
            open: false
        }
    },
    methods: {
        toggle(){
            if(this.tree.Ks && this.tree.Ks.length > 0){
                this.open = !this.open
            }
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
            ajax('get', '/api/kvtree',
                    function(e){
                        app.$data.tree = JSON.parse(e.target.responseText);
                        // console.log(app.$data.tree)
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

function ajax(method, url, func){
    const oReq = new XMLHttpRequest();
    oReq.onload = func
    oReq.onerror = function(err){
        console.log('Ajax Error :', err)
    }
    oReq.open(method, url, true)
    oReq.send()
}
