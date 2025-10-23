# Page snapshot

```yaml
- generic [ref=e4]:
  - heading "Đăng nhập" [level=2] [ref=e5]
  - generic [ref=e6]:
    - generic [ref=e7]: Email
    - textbox "Email" [ref=e8]
  - generic [ref=e9]:
    - generic [ref=e10]: Mật khẩu
    - textbox "Mật khẩu" [ref=e12]
  - generic [ref=e13]:
    - generic [ref=e14]:
      - checkbox "Nhớ đăng nhập" [ref=e15]
      - text: Nhớ đăng nhập
    - link "Quên mật khẩu?" [ref=e16] [cursor=pointer]:
      - /url: /forgot-password
  - button "Đăng nhập" [ref=e17] [cursor=pointer]
  - paragraph [ref=e18]:
    - text: Chưa có tài khoản?
    - link "Đăng ký" [ref=e19] [cursor=pointer]:
      - /url: /register
```