# Cấu hình & Ngữ Cảnh Bàn Giao (Context Handover)

Tài liệu này lưu trữ ngữ cảnh hiện tại của dự án **`mcmodel-bedrock-skill`** để các Agent (AI) tiếp quản có thể hiểu rõ tiến độ, luật lệ và cấu trúc hệ thống.

## 1. Tổng quan Dự án
Đây là một Antigravity Skill (Plugin) cấp quyền cho AI tự động xây dựng mô hình 3D Minecraft Bedrock (`.geo.json`) và tự động vẽ họa tiết (`.png`) dựa trên phân tích hình ảnh 2D hoặc mô tả văn bản, thông qua thuật toán phân tách hình học và đổ màu thủ tục.
- **Thư mục làm việc (Workspace):** `D:\code\aiskills\mcmodel-bedrock-skill`
- **Thư mục cài đặt Plugin (Local Registry):** `C:\Users\Admin\.gemini\config\plugins\mcmodel-bedrock`

## 2. Các Cập Nhật Kiến Trúc (Gần nhất)
1. **Sửa lỗi Z-Fighting:** Áp dụng thuật toán vi dịch chuyển (`shift = index * 0.005`) cho tọa độ `origin` của mọi cube để sửa lỗi đồng phẳng (Z-fighting) ngay trong engine Bedrock mà không làm thay đổi kích thước.
2. **Sửa lỗi nhòe Texture (Bleeding):** Sử dụng `Math.ceil()` để định vị tọa độ mỏ neo (UV offset) trên ảnh atlas trong khi vẫn bảo toàn kích thước float, giúp cube có số lẻ khớp hoàn hảo vào khung pixel số nguyên.
3. **Cấm Noise, ưu tiên Shaded:** Thuật toán `noise` tạo ra nhiễu hạt quá lớn làm vỡ màu. Đã cập nhật luật cấm dùng `noise` cho sinh vật hữu cơ (lông, da) hoặc vỏ xe; thay vào đó, BẮT BUỘC dùng `shaded` (Volumetric Gradient 3D + Dithering 2.5%).
4. **Quy tắc Khuôn mặt (Rule 7):** Sinh vật sống BẮT BUỘC phải có khối mắt lồi 3D và mỏ/hàm miệng rành mạch.

## 3. Các Công cụ (Tools) Mới Mở Rộng
1. **Addon Builder & Cờ `--build`:**
   - Hệ thống nay sở hữu file `src/addon_builder.js` sử dụng `adm-zip`.
   - Tool `package_addon` mới trên MCP Server cho phép tạo gói `.mcaddon` hoàn chỉnh. Tự động sinh `manifest.json`, định nghĩa Block ở Behavior Pack (`blocks/<id>.json` chuẩn 1.20.80) và map texture ở Resource Pack (`terrain_texture.json`).
2. **Đóng gói Hàng loạt (Batch Packaging - Rule 8):** AI có khả năng tạo nhiều model chạy song song qua tool `build_minecraft_asset` (không dùng cờ `--build`), sau đó gom tất cả gọi `package_addon` một lần duy nhất để nén vào 1 Addon.

## 4. Subagent & Các Đạo luật Bổ sung (Quan trọng nhất)
- **Subagent Workflow & Mandatory QA (Rule 10):** Khi tạo số lượng lớn (ví dụ: 5 model), AI phải gọi các Builder Subagent. Đặc biệt, BẮT BUỘC phải gọi ít nhất 1 **QA Subagent (Kiểm duyệt chất lượng)** để săm soi `.geo.json` và `.png`, kiểm tra lỗi trước khi cho phép xuất file.
- **Nghiên cứu Tương tác (Rule 9):** AI tuyệt đối KHÔNG ĐƯỢC tự bịa (hallucinate) JSON cho Animation (chuyển động) của Entity hoặc các tính năng tương tác của Block (ngồi lên, mở UI). AI bắt buộc phải dùng `search_web` tra cứu tài liệu Bedrock chính thống (Microsoft Learn / Bedrock.dev). Nếu bất khả thi phải báo cáo từ chối.
- **Toán học Kích thước & Trục xoay (Rule 11):** Nếu AI thay đổi `size` của cube, nó BẮT BUỘC phải tính toán lại `origin` (`[Cx - W/2, Cy - H/2, Cz - D/2]`). `pivot` của rotation phải được neo chính xác vào điểm bản lề tương đối với vị trí thực.

## 5. Trạng thái Hiện tại
- Mọi bộ luật trong `SKILL.md` đã được tối ưu đến mức hoàn hảo.
- Mã nguồn đã được Commit, Push lên nhánh `main` của GitHub.
- Local Plugin đã được đồng bộ hóa hoàn toàn.
- **Next Step (Khuyến nghị):** Agent tiếp quản có thể thử nghiệm khả năng tạo Batch (nhiều entity cùng lúc), làm việc với Subagent hoặc thử nghiệm tạo Animation JSON.
