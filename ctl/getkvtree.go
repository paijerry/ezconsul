package ctl

import (
	"CypressTools/ezconsul/env"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/paijerry/ezapi"
	"github.com/paijerry/ezerr"

	"github.com/labstack/echo"
)

const (
	TYPE_PATH = "TYPE_PATH"
	TYPE_HASV = "TYPE_HASV"
)

// JJ -
type JJ struct {
	K  string // key
	Ks []JJ   // sub keys
	V  string // value (不用了，改成另傳KVP)
	P  string // path
	T  string // type
}

// EZ -
type EZ struct {
	JJ  JJ
	KVP map[string]string
}

// GG - no used
type GG map[string]interface{}

// GetKVTree -
func GetKVTree(c echo.Context) error {

	rspn, err := ezapi.New().URL(env.ConsulAddress + "/v1/kv/?keys").Do("GET")
	if err != nil {
		fmt.Println(err.Error())
		return c.String(http.StatusOK, err.Error())
	}

	if rspn.StatusCode != http.StatusOK {
		fmt.Println("http status: ", rspn.StatusCode)
		return c.String(http.StatusOK, err.Error())
	}

	kvList := []string{}
	err = json.Unmarshal(rspn.Body, &kvList)
	if err != nil {
		// log.Error(err.Error())
		err = ezerr.New(err.Error(), "1006:gamepool")
		fmt.Println("json.Unmarshal failed")
		return c.JSON(http.StatusOK, string(rspn.Body))
	}

	return c.JSON(http.StatusOK, kvlistToKVTree(kvList))
}

func kvlistToKVTree(Kvlist []string) EZ {
	kvlistArr := [][]string{}
	for _, k := range Kvlist {
		if k[len(k)-1:] == "/" {
			continue
		}
		kvlistArr = append(kvlistArr, strings.Split(k, "/"))
	}
	jj := JJ{
		Ks: []JJ{},
	}

	for _, ks := range kvlistArr {
		jj.inin(strings.Join(ks, "/"), ks...)
	}

	ez := EZ{
		JJ:  jj,
		KVP: getKVPairs(Kvlist),
	}

	return ez
}

func (g *JJ) inin(name string, k ...string) {
	v := k[0]
	j := JJ{
		K:  v,
		Ks: []JJ{},
	}

	// 檢查是否已經寫入
	var i int
	isExist := false
	if len(g.Ks) == 0 {
		g.Ks = append(g.Ks, j)
		i = 0
		// fmt.Println(v)
	} else {
		for ii, vvv := range g.Ks {
			if vvv.K == v {
				// fmt.Println(vvv.K)
				isExist = true
				i = ii
				break
			}
		}
		if !isExist {
			g.Ks = append(g.Ks, j)
			i = len(g.Ks) - 1
		}
	}

	// 判斷是是否為最後一個 (放 K or V)
	g.Ks[i].T = TYPE_PATH
	if len(k) == 1 { // 放 V, 寫入 V
		// s, err := getV(name)
		// if err != nil {
		// 	return
		// }
		// g.Ks[i].V = s
		g.Ks[i].P = name
		g.Ks[i].T = TYPE_HASV
		return
	}

	// 放 K, 需再遞迴繼續往下
	k = append(k[:0], k[1:]...)
	// fmt.Println(k)
	g.Ks[i].inin(name, k...)
}

func getV(k string) (s string, err error) {
	rspn, err := ezapi.New().URL(env.ConsulAddress + "/v1/kv/" + k + "?raw").Do("GET")
	if err != nil {
		fmt.Println(err.Error())
		return
	}

	if rspn.StatusCode != http.StatusOK {
		fmt.Println("http status: ", rspn.StatusCode)
		err = fmt.Errorf("http status: ", rspn.StatusCode)
		return
	}

	return string(rspn.Body), nil
}

func getKVPairs(Ks []string) (kvp map[string]string) {
	kvp = map[string]string{}
	for i := 0; i < len(Ks); i++ {
		s, err := getV(Ks[i])
		if err == nil {
			kvp[Ks[i]] = s
		}
	}
	return

}
