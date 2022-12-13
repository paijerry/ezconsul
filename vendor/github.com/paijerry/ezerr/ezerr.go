package ezerr

import "fmt"

// EzErr -
type EzErr struct {
	code   string
	msg    string
	detail []interface{}
}

// Error - as an error, must have this method
func (e *EzErr) Error() (errResult string) {
	errResult = e.msg
	if e.code != "" {
		errResult = fmt.Sprintf("<%v> %v", e.code, errResult)
	}
	if len(e.detail) != 0 {
		errResult = fmt.Sprintf("%v %v", errResult, e.detail)
	}
	return
}

// GetCode - get code of the ezerr
func (e *EzErr) GetCode() string {
	return e.code
}

// GetMsg - get message of the ezerr
func (e *EzErr) GetMsg() string {
	return e.msg
}

// SetDetail - set any detail into ezerr
func (e *EzErr) SetDetail(detail interface{}) *EzErr {
	e.detail = append(e.detail, detail)
	return e
}

// GetDetail - get all the detail of the ezerr
func (e *EzErr) GetDetail() []interface{} {
	return e.detail
}

// New - generate ezerr
func New(msg string, code ...string) *EzErr {
	c := ""
	if len(code) != 0 {
		c = code[0]
	}
	return &EzErr{
		code: c,
		msg:  msg,
	}
}

// IsEz - check the error is ezerr or not
func IsEz(err error) bool {
	_, ok := err.(*EzErr)
	return ok
}

// ToEz -
func ToEz(err error) *EzErr {
	ez, ok := err.(*EzErr)
	if ok {
		return ez
	}
	return New(err.Error())
}
