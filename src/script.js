console.clear();

const { useState, useRef, useEffect, useMemo } = React;

const {
  RecoilRoot,
  atom,
  atomFamily,
  useRecoilState,
  useSetRecoilState,
  useRecoilValue
} = Recoil;

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
  Alert: MuiAlert
} = MaterialUI;

const Alert = React.forwardRef((props, ref) => {
  return <MuiAlert {...props} ref={ref} variant="filled" />;
});

const todosAtom = atom({
  key: "app/todosAtom",
  default: []
});
const lastTodoIdAtom = atom({
  key: "app/lastTodoIdAtom",
  default: 0
});
function useTodosStatus() {
  const [todos, setTodos] = useRecoilState(todosAtom);
  const [lastTodoId, setLastTodoId] = useRecoilState(lastTodoIdAtom);
  const lastTodoIdRef = useRef(lastTodoId);

  lastTodoIdRef.current = lastTodoId;

  const addTodo = (newContent) => {
    const id = ++lastTodoIdRef.current;
    setLastTodoId(id);
    const newTodo = {
      id,
      content: newContent,
      regDate: dateToStr(new Date())
    };

    setTodos((todos) => [newTodo, ...todos]);

    return id;
  };

  const modifyTodo = (index, newContent) => {
    const newTodos = todos.map((todo, _index) =>
      _index != index ? todo : { ...todo, content: newContent }
    );
    setTodos(newTodos);
  };

  const modifyTodoById = (id, newContent) => {
    const index = findTodoIndexById(id);

    if (index == -1) {
      return;
    }

    modifyTodo(index, newContent);
  };

  const removeTodo = (index) => {
    const newTodos = todos.filter((_, _index) => _index != index);
    setTodos(newTodos);
  };

  const removeTodoById = (id) => {
    const index = findTodoIndexById(id);

    if (index != -1) {
      removeTodo(index);
    }
  };

  const findTodoIndexById = (id) => {
    return todos.findIndex((todo) => todo.id == id);
  };

  const findTodoById = (id) => {
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
    findTodoById
  };
}

function TodoListItem({ todo, index, openDrawer }) {
  return (
    <>
      <li key={todo.id} className="mt-10">
        <div className="flex gap-2">
          <Chip
            label={`번호 : ${todo.id}`}
            variant="outlined"
            className="!pt-1"
          />
          <Chip
            label={todo.regDate}
            color="primary"
            variant="outlined"
            className="!pt-1"
          />
        </div>
        <div className="mt-4 shadow rounded-[20px] flex">
          <Button
            className="flex-shrink-0 !items-start !rounded-[20px_0_0_20px]"
            color="inherit"
          >
            <span
              className={classNames(
                "text-4xl",
                "h-[80px]",
                "flex items-center",
                {
                  "text-[color:var(--mui-color-primary-main)]": index % 2 == 0
                },
                { "text-[#dcdcdc]": index % 2 != 0 }
              )}
            >
              <i className="fa-solid fa-check"></i>
            </span>
          </Button>
          <div className="flex-shrink-0 my-5 w-[2px] bg-[#dcdcdc] mr-4"></div>
          <div className="whitespace-pre-wrap leading-relaxed hover:text-[color:var(--mui-color-primary-main)] flex-grow flex items-center my-5">
            {todo.content}
          </div>
          <Button
            onClick={() => openDrawer(todo.id)}
            className="flex-shrink-0 !items-start !rounded-[0_20px_20px_0]"
            color="inherit"
          >
            <span className="text-[#dcdcdc] text-2xl h-[80px] flex items-center">
              <i className="fa-solid fa-ellipsis-vertical"></i>
            </span>
          </Button>
        </div>
      </li>
    </>
  );
}

function useTodoOptionDrawerStatus() {
  const [todoId, setTodoId] = useState(null);
  const opened = useMemo(() => todoId !== null, [todoId]);
  const close = () => setTodoId(null);
  const open = (id) => setTodoId(id);

  return {
    todoId,
    opened,
    close,
    open
  };
}

function EditTodoModal({
  status,
  todo,
  closeDrawer,
  noticeSnackbarStatus
}) {
  const todosStatus = useTodosStatus();
  
  const close = () => {
    status.close();
    closeDrawer();
  };

  const onSubmit = (e) => {
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

  return (
    <>
      <Modal
        open={status.opened}
        onClose={close}
        className="flex justify-center items-center"
      >
        <div className="bg-white rounded-[20px] p-7 w-full max-w-lg">
          <form onSubmit={onSubmit} className="flex flex-col gap-2">
            <TextField
              minRows={3}
              maxRows={10}
              multiline
              autoComplete="off"
              name="content"
              label="할일을 입력해주세요."
              variant="outlined"
              defaultValue={todo?.content}
            />

            <Button type="submit" variant="contained">
              수정
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
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
    close
  };
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
      "info"
    );
  };

  const editTodoModalStatus = useEditTodoModalStatus();

  const todo = todosStatus.findTodoById(status.todoId);

  return (
    <>
      <EditTodoModal
        status={editTodoModalStatus}
        todo={todo}
        closeDrawer={status.close}
        noticeSnackbarStatus={noticeSnackbarStatus}
      />
      <SwipeableDrawer
        anchor={"bottom"}
        onOpen={() => {}}
        open={status.opened}
        onClose={status.close}
      >
        <List className="!py-0">
          <ListItem className="!pt-6 !p-5">
            <span className="text-[color:var(--mui-color-primary-main)]">
              {todo?.id}번
            </span>
            <span>&nbsp;</span>
            <span>할일에 대해서</span>
          </ListItem>
          <Divider />
          <ListItem
            className="!pt-6 !p-5 !items-baseline"
            button
            onClick={removeTodo}
          >
            <i className="fa-solid fa-trash-can"></i>
            &nbsp;
            <span>삭제</span>
          </ListItem>
          <ListItem
            className="!pt-6 !p-5 !items-baseline"
            button
            onClick={editTodoModalStatus.open}
          >
            <i className="fa-solid fa-pen-to-square"></i>
            &nbsp;
            <span>수정</span>
          </ListItem>
        </List>
      </SwipeableDrawer>
    </>
  );
}

function TodoList({ noticeSnackbarStatus }) {
  const todosStatus = useTodosStatus();
  const todoOptionDrawerStatus = useTodoOptionDrawerStatus();

  return (
    <>
      <TodoOptionDrawer
        status={todoOptionDrawerStatus}
        noticeSnackbarStatus={noticeSnackbarStatus}
      />
      <div className="mt-4 px-4">
        <ul>
          {todosStatus.todos.map((todo, index) => (
            <TodoListItem
              key={todo.id}
              todo={todo}
              index={index}
              openDrawer={todoOptionDrawerStatus.open}
            />
          ))}
        </ul>
      </div>
    </>
  );
}

function NewTodoForm({ noticeSnackbarStatus }) {
  const todosStatus = useTodosStatus();
  const onSubmit = (e) => {
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

  return (
    <>
      <form onSubmit={onSubmit} className="flex flex-col mt-4 px-4 gap-2">
        <TextField
          minRows={3}
          maxRows={10}
          multiline
          autoComplete="off"
          name="content"
          label="할일을 입력해주세요."
          variant="outlined"
        />

        <Button type="submit" variant="contained">
          추가
        </Button>
      </form>
    </>
  );
}

function NoticeSnackbar({ status }) {
  return (
    <>
      <Snackbar
        open={status.opened}
        autoHideDuration={status.autoHideDuration}
        onClose={status.close}
      >
        <Alert severity={status.severity}>{status.msg}</Alert>
      </Snackbar>
    </>
  );
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
    msg
  };
}

function App() {
  const todosStatus = useTodosStatus();
  const noticeSnackbarStatus = useNoticeSnackbarStatus();

  useEffect(() => {
    todosStatus.addTodo("운동\n스트레칭\n유산소\n상체\n하체볼륨 트레이닝");
    todosStatus.addTodo("명상");
    todosStatus.addTodo("공부");
  }, []);

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <div className="flex-1"></div>
          <span className="font-bold">일기장</span>
          <div className="flex-1"></div>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <NoticeSnackbar status={noticeSnackbarStatus} />
      <NewTodoForm noticeSnackbarStatus={noticeSnackbarStatus} />
      <TodoList noticeSnackbarStatus={noticeSnackbarStatus} />
    </>
  );
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
  "warning"
];

function Root() {
  // Create a theme instance.
  const theme = createTheme({
    typography: {
      fontFamily: ["GmarketSansMedium"]
    },
    palette: {
      primary: {
        main: "#ff8686",
        contrastText: "#ffffff"
      }
    }
  });

  useEffect(() => {
    const r = document.querySelector(":root");

    muiThemePaletteKeys.forEach((paletteKey) => {
      const themeColorObj = theme.palette[paletteKey];

      for (const key in themeColorObj) {
        if (Object.hasOwnProperty.call(themeColorObj, key)) {
          const colorVal = themeColorObj[key];
          r.style.setProperty(`--mui-color-${paletteKey}-${key}`, colorVal);
        }
      }
    });
  }, []);

  return (
    <RecoilRoot>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </RecoilRoot>
  );
}

ReactDOM.render(<Root />, document.getElementById("root"));

// 유틸리티

// 날짜 객체 입력받아서 문장(yyyy-mm-dd hh:mm:ss)으로 반환한다.
function dateToStr(d) {
  const pad = (n) => {
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
    pad(d.getSeconds())
  );
}
