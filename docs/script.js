function _extends() {_extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};return _extends.apply(this, arguments);}console.clear();

const { useState, useRef, useEffect, useMemo } = React;

const {
  RecoilRoot,
  atom,
  atomFamily,
  useRecoilState,
  useSetRecoilState,
  useRecoilValue } =
Recoil;

import classNames from "https://cdn.skypack.dev/classnames";

const {
  colors,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Link,
  Button,
  AppBar,
  Toolbar,
  TextField,
  Chip,
  Box,
  SwipeableDrawer,
  List,
  ListItem,
  Divider,
  Modal,
  Snackbar,
  Alert: MuiAlert } =
MaterialUI;

const Alert = React.forwardRef((props, ref) => {
  return /*#__PURE__*/React.createElement(MuiAlert, _extends({}, props, { ref: ref, variant: "filled" }));
});

const todosAtom = atom({
  key: "app/todosAtom",
  default: [] });

const lastTodoIdAtom = atom({
  key: "app/lastTodoIdAtom",
  default: 0 });

function useTodosStatus() {
  const [todos, setTodos] = useRecoilState(todosAtom);
  const [lastTodoId, setLastTodoId] = useRecoilState(lastTodoIdAtom);
  const lastTodoIdRef = useRef(lastTodoId);

  lastTodoIdRef.current = lastTodoId;

  const addTodo = newContent => {
    const id = ++lastTodoIdRef.current;
    setLastTodoId(id);
    const newTodo = {
      id,
      content: newContent,
      regDate: dateToStr(new Date()) };


    setTodos(todos => [newTodo, ...todos]);

    return id;
  };

  const modifyTodo = (index, newContent) => {
    const newTodos = todos.map((todo, _index) =>
    _index != index ? todo : { ...todo, content: newContent });

    setTodos(newTodos);
  };

  const modifyTodoById = (id, newContent) => {
    const index = findTodoIndexById(id);

    if (index == -1) {
      return;
    }

    modifyTodo(index, newContent);
  };

  const removeTodo = index => {
    const newTodos = todos.filter((_, _index) => _index != index);
    setTodos(newTodos);
  };

  const removeTodoById = id => {
    const index = findTodoIndexById(id);

    if (index != -1) {
      removeTodo(index);
    }
  };

  const findTodoIndexById = id => {
    return todos.findIndex(todo => todo.id == id);
  };

  const findTodoById = id => {
    const index = findTodoIndexById(id);

    if (index == -1) {
      return null;
    }

    return todos[index];
  };

  return {
    todos,
    addTodo,
    modifyTodo,
    modifyTodoById,
    removeTodo,
    removeTodoById,
    findTodoById };

}

function TodoListItem({ todo, index, openDrawer }) {
  return /*#__PURE__*/(
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("li", { key: todo.id, className: "mt-10" }, /*#__PURE__*/
    React.createElement("div", { className: "flex gap-2" }, /*#__PURE__*/
    React.createElement(Chip, {
      label: `번호 : ${todo.id}`,
      variant: "outlined",
      className: "!pt-1" }), /*#__PURE__*/

    React.createElement(Chip, {
      label: todo.regDate,
      color: "primary",
      variant: "outlined",
      className: "!pt-1" })), /*#__PURE__*/


    React.createElement("div", { className: "mt-4 shadow rounded-[20px] flex" }, /*#__PURE__*/
    React.createElement(Button, {
      className: "flex-shrink-0 !items-start !rounded-[20px_0_0_20px]",
      color: "inherit" }, /*#__PURE__*/

    React.createElement("span", {
      className: classNames(
      "text-4xl",
      "h-[80px]",
      "flex items-center",
      {
        "text-[color:var(--mui-color-primary-main)]": index % 2 == 0 },

      { "text-[#dcdcdc]": index % 2 != 0 }) }, /*#__PURE__*/


    React.createElement("i", { className: "fa-solid fa-check" }))), /*#__PURE__*/


    React.createElement("div", { className: "flex-shrink-0 my-5 w-[2px] bg-[#dcdcdc] mr-4" }), /*#__PURE__*/
    React.createElement("div", { className: "whitespace-pre-wrap leading-relaxed hover:text-[color:var(--mui-color-primary-main)] flex-grow flex items-center my-5" },
    todo.content), /*#__PURE__*/

    React.createElement(Button, {
      onClick: () => openDrawer(todo.id),
      className: "flex-shrink-0 !items-start !rounded-[0_20px_20px_0]",
      color: "inherit" }, /*#__PURE__*/

    React.createElement("span", { className: "text-[#dcdcdc] text-2xl h-[80px] flex items-center" }, /*#__PURE__*/
    React.createElement("i", { className: "fa-solid fa-ellipsis-vertical" })))))));






}

function useTodoOptionDrawerStatus() {
  const [todoId, setTodoId] = useState(null);
  const opened = useMemo(() => todoId !== null, [todoId]);
  const close = () => setTodoId(null);
  const open = id => setTodoId(id);

  return {
    todoId,
    opened,
    close,
    open };

}

function EditTodoModal({
  status,
  todo,
  closeDrawer,
  noticeSnackbarStatus })
{
  const todosStatus = useTodosStatus();

  const close = () => {
    status.close();
    closeDrawer();
  };

  const onSubmit = e => {
    e.preventDefault();

    const form = e.target;

    form.content.value = form.content.value.trim();

    if (form.content.value.length == 0) {
      alert("할일을 입력해주세요.");
      form.content.focus();
      return;
    }

    todosStatus.modifyTodoById(todo.id, form.content.value);
    close();
    noticeSnackbarStatus.open(`${todo.id}번 할일이 수정되었습니다.`, "info");
  };

  return /*#__PURE__*/(
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement(Modal, {
      open: status.opened,
      onClose: close,
      className: "flex justify-center items-center" }, /*#__PURE__*/

    React.createElement("div", { className: "bg-white rounded-[20px] p-7 w-full max-w-lg" }, /*#__PURE__*/
    React.createElement("form", { onSubmit: onSubmit, className: "flex flex-col gap-2" }, /*#__PURE__*/
    React.createElement(TextField, {
      minRows: 3,
      maxRows: 10,
      multiline: true,
      autoComplete: "off",
      name: "content",
      label: "\uD560\uC77C\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.",
      variant: "outlined",
      defaultValue: todo === null || todo === void 0 ? void 0 : todo.content }), /*#__PURE__*/


    React.createElement(Button, { type: "submit", variant: "contained" }, "\uC218\uC815"))))));







}

function useEditTodoModalStatus() {
  const [opened, setOpened] = useState(false);

  const open = () => {
    setOpened(true);
  };

  const close = () => {
    setOpened(false);
  };

  return {
    opened,
    open,
    close };

}

function TodoOptionDrawer({ status, noticeSnackbarStatus }) {
  const todosStatus = useTodosStatus();
  const removeTodo = () => {
    if (confirm(`${status.todoId}번 할일을 삭제하시겠습니까?`) == false) {
      status.close();
      return;
    }

    todosStatus.removeTodoById(status.todoId);
    status.close();
    noticeSnackbarStatus.open(
    `${status.todoId}번 할일이 삭제되었습니다.`,
    "info");

  };

  const editTodoModalStatus = useEditTodoModalStatus();

  const todo = todosStatus.findTodoById(status.todoId);

  return /*#__PURE__*/(
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement(EditTodoModal, {
      status: editTodoModalStatus,
      todo: todo,
      closeDrawer: status.close,
      noticeSnackbarStatus: noticeSnackbarStatus }), /*#__PURE__*/

    React.createElement(SwipeableDrawer, {
      anchor: "bottom",
      onOpen: () => {},
      open: status.opened,
      onClose: status.close }, /*#__PURE__*/

    React.createElement(List, { className: "!py-0" }, /*#__PURE__*/
    React.createElement(ListItem, { className: "!pt-6 !p-5" }, /*#__PURE__*/
    React.createElement("span", { className: "text-[color:var(--mui-color-primary-main)]" },
    todo === null || todo === void 0 ? void 0 : todo.id, "\uBC88"), /*#__PURE__*/

    React.createElement("span", null, "\xA0"), /*#__PURE__*/
    React.createElement("span", null, "\uD560\uC77C\uC5D0 \uB300\uD574\uC11C")), /*#__PURE__*/

    React.createElement(Divider, null), /*#__PURE__*/
    React.createElement(ListItem, {
      className: "!pt-6 !p-5 !items-baseline",
      button: true,
      onClick: removeTodo }, /*#__PURE__*/

    React.createElement("i", { className: "fa-solid fa-trash-can" }), "\xA0", /*#__PURE__*/

    React.createElement("span", null, "\uC0AD\uC81C")), /*#__PURE__*/

    React.createElement(ListItem, {
      className: "!pt-6 !p-5 !items-baseline",
      button: true,
      onClick: editTodoModalStatus.open }, /*#__PURE__*/

    React.createElement("i", { className: "fa-solid fa-pen-to-square" }), "\xA0", /*#__PURE__*/

    React.createElement("span", null, "\uC218\uC815"))))));





}

function TodoList({ noticeSnackbarStatus }) {
  const todosStatus = useTodosStatus();
  const todoOptionDrawerStatus = useTodoOptionDrawerStatus();

  return /*#__PURE__*/(
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement(TodoOptionDrawer, {
      status: todoOptionDrawerStatus,
      noticeSnackbarStatus: noticeSnackbarStatus }), /*#__PURE__*/

    React.createElement("div", { className: "mt-4 px-4" }, /*#__PURE__*/
    React.createElement("ul", null,
    todosStatus.todos.map((todo, index) => /*#__PURE__*/
    React.createElement(TodoListItem, {
      key: todo.id,
      todo: todo,
      index: index,
      openDrawer: todoOptionDrawerStatus.open }))))));






}

function NewTodoForm({ noticeSnackbarStatus }) {
  const todosStatus = useTodosStatus();
  const onSubmit = e => {
    e.preventDefault();

    const form = e.target;

    form.content.value = form.content.value.trim();

    if (form.content.value.length == 0) {
      alert("할일을 입력해주세요.");
      form.content.focus();

      return;
    }

    const newTodoId = todosStatus.addTodo(form.content.value);
    form.content.value = "";
    form.content.focus();
    noticeSnackbarStatus.open(`${newTodoId}번 할일이 추가되었습니다.`);
  };

  return /*#__PURE__*/(
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("form", { onSubmit: onSubmit, className: "flex flex-col mt-4 px-4 gap-2" }, /*#__PURE__*/
    React.createElement(TextField, {
      minRows: 3,
      maxRows: 10,
      multiline: true,
      autoComplete: "off",
      name: "content",
      label: "\uD560\uC77C\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.",
      variant: "outlined" }), /*#__PURE__*/


    React.createElement(Button, { type: "submit", variant: "contained" }, "\uCD94\uAC00"))));





}

function NoticeSnackbar({ status }) {
  return /*#__PURE__*/(
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement(Snackbar, {
      open: status.opened,
      autoHideDuration: status.autoHideDuration,
      onClose: status.close }, /*#__PURE__*/

    React.createElement(Alert, { severity: status.severity }, status.msg))));



}

function useNoticeSnackbarStatus() {
  const [opened, setOpened] = useState(false);
  const [autoHideDuration, setAutoHideDuration] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [msg, setMsg] = useState(null);

  const open = (msg, severity = "success", autoHideDuration = 6000) => {
    setOpened(true);
    setMsg(msg);
    setSeverity(severity);
    setAutoHideDuration(autoHideDuration);
  };

  const close = () => {
    setOpened(false);
  };

  return {
    opened,
    open,
    close,
    autoHideDuration,
    severity,
    msg };

}

function App() {
  const todosStatus = useTodosStatus();
  const noticeSnackbarStatus = useNoticeSnackbarStatus();

  useEffect(() => {
    todosStatus.addTodo("운동\n스트레칭\n유산소\n상체\n하체볼륨 트레이닝");
    todosStatus.addTodo("명상");
    todosStatus.addTodo("공부");
  }, []);

  return /*#__PURE__*/(
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement(AppBar, { position: "fixed" }, /*#__PURE__*/
    React.createElement(Toolbar, null, /*#__PURE__*/
    React.createElement("div", { className: "flex-1" }), /*#__PURE__*/
    React.createElement("span", { className: "font-bold" }, "HAPPY NOTE"), /*#__PURE__*/
    React.createElement("div", { className: "flex-1" }))), /*#__PURE__*/


    React.createElement(Toolbar, null), /*#__PURE__*/
    React.createElement(NoticeSnackbar, { status: noticeSnackbarStatus }), /*#__PURE__*/
    React.createElement(NewTodoForm, { noticeSnackbarStatus: noticeSnackbarStatus }), /*#__PURE__*/
    React.createElement(TodoList, { noticeSnackbarStatus: noticeSnackbarStatus })));


}

const muiThemePaletteKeys = [
"background",
"common",
"error",
"grey",
"info",
"primary",
"secondary",
"success",
"text",
"warning"];


function Root() {
  // Create a theme instance.
  const theme = createTheme({
    typography: {
      fontFamily: ["GmarketSansMedium"] },

    palette: {
      primary: {
        main: "#ff8686",
        contrastText: "#ffffff" } } });




  useEffect(() => {
    const r = document.querySelector(":root");

    muiThemePaletteKeys.forEach(paletteKey => {
      const themeColorObj = theme.palette[paletteKey];

      for (const key in themeColorObj) {
        if (Object.hasOwnProperty.call(themeColorObj, key)) {
          const colorVal = themeColorObj[key];
          r.style.setProperty(`--mui-color-${paletteKey}-${key}`, colorVal);
        }
      }
    });
  }, []);

  return /*#__PURE__*/(
    React.createElement(RecoilRoot, null, /*#__PURE__*/
    React.createElement(ThemeProvider, { theme: theme }, /*#__PURE__*/
    React.createElement(CssBaseline, null), /*#__PURE__*/
    React.createElement(App, null))));



}

ReactDOM.render( /*#__PURE__*/React.createElement(Root, null), document.getElementById("root"));

// 유틸리티

// 날짜 객체 입력받아서 문장(yyyy-mm-dd hh:mm:ss)으로 반환한다.
function dateToStr(d) {
  const pad = n => {
    return n < 10 ? "0" + n : n;
  };

  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    " " +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes()) +
    ":" +
    pad(d.getSeconds()));

}