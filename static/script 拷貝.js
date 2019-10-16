var Consul = {
    template: `
      <li @click.stop="toggle">
        0{{key}}1
        <ul v-show="open" v-if="tree && tree.length > 0">
          <consul v-for="(node, index) in tree" :tree="node" :key="index" ></consul>
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
        // getKVTree: function(){
        //     ajax('get', '/api/kvtree',
        //             function(e){
        //                 app.$data.tree = JSON.parse(e.target.responseText);
        //                 console.log(app.$data.tree)
        //             });
        // },
        toggle(){
            if(this.tree && this.tree.length > 0){
            this.open = !this.open
            }
        }
    }
    // beforeMount(){
    //     console.log("beforeMount")
    //     this.getKVTree()
    //     console.log(this.$data.tree)
    // }
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
                        console.log(app.$data.tree)
                    });
        },
    },
    mounted(){
        this.getKVTree()
    },
})

function getKVTree(){
    ajax('get', '/api/kvtree',
            function(e){
                app.$data.tree = JSON.parse(e.target.responseText);
            });
}

function ajax(method, url, func){
    const oReq = new XMLHttpRequest();
    oReq.onload = func
    oReq.onerror = function(err){
        console.log('Ajax Error :', err)
    }
    oReq.open(method, url, true)
    oReq.send()
}
