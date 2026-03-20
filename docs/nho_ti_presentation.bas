Attribute VB_Name = "NhoTiPresentation"
Option Explicit

' Import module này vào PowerPoint VBA Editor rồi chạy BuildNhoTiDeck.

Private Const PAGE_WIDTH As Single = 960
Private Const PAGE_HEIGHT As Single = 540

Private Const PP_LAYOUT_BLANK As Long = 12
Private Const MSO_FALSE As Long = 0
Private Const MSO_TRUE As Long = -1
Private Const TEXT_ORIENTATION_HORIZONTAL As Long = 1
Private Const SHAPE_RECTANGLE As Long = 1
Private Const SHAPE_ROUNDED_RECTANGLE As Long = 5
Private Const SHAPE_OVAL As Long = 9
Private Const ALIGN_LEFT As Long = 1
Private Const ALIGN_CENTER As Long = 2
Private Const ANCHOR_TOP As Long = 1
Private Const ANCHOR_MIDDLE As Long = 3
Private Const AUTO_SIZE_FIT_TEXT As Long = 2

Private Const FONT_HEADING As String = "Arial Black"
Private Const FONT_BODY As String = "Aptos"
Private Const FONT_BODY_FALLBACK As String = "Calibri"

Public Sub BuildNhoTiDeck()
    Dim pres As Object

    Set pres = Application.Presentations.Add
    SetupPresentationTheme pres

    BuildSlide01 pres
    BuildSlide02 pres
    BuildSlide03 pres
    BuildSlide04 pres
    BuildSlide05 pres
    BuildSlide06 pres
    BuildSlide07 pres
    BuildSlide08 pres
    BuildSlide09 pres
    BuildSlide10 pres
    BuildSlide11 pres

    On Error Resume Next
    Application.ActiveWindow.View.GotoSlide 1
    On Error GoTo 0
End Sub

Private Sub SetupPresentationTheme(ByVal pres As Object)
    With pres.PageSetup
        .SlideWidth = PAGE_WIDTH
        .SlideHeight = PAGE_HEIGHT
    End With
End Sub

Private Sub BuildSlide01(ByVal pres As Object)
    Dim stats As Variant

    stats = Array( _
        Array("Mô hình", "Nền tảng 2 phía", "Kết nối đúng nhu cầu thật với đúng năng lực phù hợp."), _
        Array("Cách làm", "AI hỗ trợ", "Chuẩn hóa brief, matching và nhịp phối hợp cơ bản."), _
        Array("Giai đoạn", "Early MVP", "Đang kiểm chứng mô hình trước khi mở rộng.") _
    )

    AddHeroSlide pres, 1, "violet", "Nho Ti", "Pitch deck", _
        "Việc nhỏ, giá trị thật", _
        "Nền tảng AI kết nối sinh viên với doanh nghiệp SME qua các micro-project thực tế.", _
        Array("AI hỗ trợ", "Micro-project", "Sinh viên x SME"), _
        Array( _
            "Bắt đầu từ đầu việc nhỏ nhưng đủ thật để học và làm.", _
            "Giảm ma sát từ brief đến matching và bàn giao.", _
            "Tạo giá trị rõ cho cả sinh viên lẫn SME." _
        ), _
        "Từ việc nhỏ, đi tới năng lực thật và đầu ra thật.", _
        "Hero mở đầu", _
        "Placeholder cover: cầu nối giữa sinh viên, SME và AI.", _
        stats
End Sub

Private Sub BuildSlide02(ByVal pres As Object)
    Dim slide As Object
    Dim cards As Variant

    cards = Array( _
        Array("Sinh viên", "Nhỏ tí", "Bắt đầu từ project nhỏ để xây kỹ năng, portfolio và sự tự tin."), _
        Array("Doanh nghiệp", "Nhờ tí", "Những đầu việc nhỏ nhưng thực tế, cần đúng người hỗ trợ nhanh."), _
        Array("Mô hình", "AI kết nối", "Làm rõ nhu cầu, ghép đúng người và tạo quy trình triển khai rõ hơn.") _
    )

    Set slide = AddSplitSlide( _
        pres, 2, "yellow", "01", "Định vị", _
        "Nho Ti là gì?", _
        "Tên gọi gói gọn đúng mô hình: sinh viên bắt đầu từ việc nhỏ tí, SME có thể nhờ tí đúng người hỗ trợ.", _
        Array( _
            "Không chỉ là nơi đăng việc.", _
            "Là nền tảng kết nối nhu cầu thật với năng lực đang lớn lên." _
        ), _
        Array("Nhỏ tí", "Nhờ tí", "AI kết nối"), _
        Empty, _
        "Nho Ti đứng giữa hai nhu cầu thật: cơ hội thực chiến và nhu cầu số hóa ngắn hạn." _
    )

    AddDualMeaningDiagram slide, 520, 148, 388, 146, "yellow"
    AddCardGrid slide, cards, 520, 314, 388, 154, 3, "yellow"
End Sub

Private Sub BuildSlide03(ByVal pres As Object)
    Dim slide As Object

    Set slide = AddSplitSlide( _
        pres, 3, "pink", "02", "Problem", _
        "Khoảng trống giữa học và làm", _
        "Sinh viên thiếu việc thật để chứng minh năng lực; SME có việc thật nhưng khó giao đúng người.", _
        Array( _
            "Hai phía đều có nhu cầu thật.", _
            "Điểm nghẽn nằm ở brief, matching và cơ chế phối hợp." _
        ), _
        Array("Portfolio mỏng", "Brief mơ hồ", "Lệch pha thị trường"), _
        Empty, _
        "Cơ hội và nhu cầu đang tồn tại, nhưng chưa gặp nhau theo một cách đủ thực dụng." _
    )

    AddPlaceholderVisual slide, "Phía sinh viên", _
        "Placeholder: có kỹ năng nhưng thiếu cơ hội thực chiến và portfolio đủ mạnh.", _
        520, 152, 184, 236, "pink", "Placeholder ảnh"

    AddPlaceholderVisual slide, "Phía SME", _
        "Placeholder: nhiều việc số hóa nhỏ nhưng thiếu nguồn lực phù hợp để xử lý nhanh.", _
        724, 152, 184, 236, "pink", "Placeholder ảnh"

    AddEmphasisCard slide, "Hai bên đều có nhu cầu thật, nhưng thị trường hiện tại chưa làm khớp đủ nhanh và đủ rõ.", _
        520, 404, 388, 66, "pink"
End Sub

Private Sub BuildSlide04(ByVal pres As Object)
    Dim matrixItems As Variant

    matrixItems = Array( _
        Array("Mô hình 1", "Job board", Array( _
            "Tối ưu cho vị trí dài hạn.", _
            "Doanh nghiệp phải viết yêu cầu khá rõ ngay từ đầu.", _
            "Không phù hợp với việc ngắn, nhỏ, thay đổi nhanh." _
        ), ""), _
        Array("Mô hình 2", "Freelancer marketplace", Array( _
            "Tối ưu cho người làm đã có kinh nghiệm.", _
            "Sinh viên khó nổi bật khi thiếu portfolio.", _
            "SME khó biến việc nhỏ thành brief đủ chuẩn." _
        ), ""), _
        Array("Khoảng trống", "Nho Ti nhắm tới", Array( _
            "Chuẩn hóa bài toán nhỏ.", _
            "Gợi ý người phù hợp theo năng lực.", _
            "Đo giá trị bằng đầu ra thật và phản hồi thật." _
        ), "Micro-project rõ đầu ra") _
    )

    AddMatrixSlide pres, 4, "orange", "03", "Gap", _
        "Vì sao giải pháp hiện tại chưa đủ", _
        "Job board và freelancer marketplace giải quyết tốt ngữ cảnh của riêng họ, nhưng chưa phục vụ tốt nhóm micro-project rõ đầu ra cho SME và sinh viên.", _
        Array( _
            "Job board mạnh ở tuyển dụng dài hạn.", _
            "Freelancer marketplace mạnh ở thuê người đã có hồ sơ mạnh." _
        ), _
        Empty, _
        "Khoảng trống còn lại là đầu việc nhỏ, brief chưa rõ và nhu cầu tích lũy hồ sơ thực chiến.", _
        matrixItems, _
        Empty, _
        3
End Sub

Private Sub BuildSlide05(ByVal pres As Object)
    Dim steps As Variant
    Dim stats As Variant

    steps = Array( _
        Array("SME nêu nhu cầu", "Bắt đầu từ mô tả đầu việc số hóa nhỏ."), _
        Array("AI chuẩn hóa brief", "Làm rõ mục tiêu, đầu ra và kỳ vọng cơ bản."), _
        Array("Matching sinh viên", "Gợi ý người phù hợp theo hồ sơ năng lực."), _
        Array("Triển khai và đánh giá", "Theo dõi mốc, đầu ra và phản hồi sau khi hoàn thành.") _
    )

    stats = Array( _
        Array("Brief", "Rõ hơn", "Giảm ma sát ngay từ bước mô tả yêu cầu."), _
        Array("Matching", "Nhanh hơn", "Không chỉ liệt kê, mà gợi ý theo độ phù hợp."), _
        Array("Kết quả", "Đo được", "Có đầu ra, phản hồi và hồ sơ thực chiến tích lũy.") _
    )

    AddProcessSlide pres, 5, "cyan", "04", "Solution", _
        "Nho Ti giải quyết như thế nào?", _
        "Chuẩn hóa nhu cầu, gợi ý đúng người và biến đầu việc nhỏ thành quy trình có thể giao, theo dõi và đánh giá.", _
        Array( _
            "Doanh nghiệp không cần bắt đầu bằng một brief hoàn chỉnh.", _
            "Sinh viên thấy project phù hợp thay vì tự mò cơ hội rời rạc." _
        ), _
        steps, _
        stats, _
        "Mockup sản phẩm", _
        "Placeholder cho brief SME, AI chuẩn hóa, matching sinh viên và tiến độ dự án."
End Sub

Private Sub BuildSlide06(ByVal pres As Object)
    Dim slide As Object
    Dim cards As Variant

    cards = Array( _
        Array("Vai trò 1", "Chuẩn hóa brief", "Biến mô tả thô thành yêu cầu dễ hiểu và dễ giao việc hơn."), _
        Array("Vai trò 2", "Matching", "So sánh yêu cầu với hồ sơ kỹ năng để gợi ý độ phù hợp."), _
        Array("Vai trò 3", "Hỗ trợ quy trình", "Tóm tắt tiến độ, nhắc deadline và gợi ý bước tiếp theo.") _
    )

    Set slide = AddSplitSlide( _
        pres, 6, "lime", "05", "AI role", _
        "AI hỗ trợ, không thay thế", _
        "AI giúp giảm ma sát trong quy trình; con người vẫn quyết định bối cảnh, phản hồi và chất lượng đầu ra.", _
        Array( _
            "AI mạnh ở phần lặp lại, mơ hồ và tốn thời gian diễn đạt.", _
            "Con người vẫn chịu trách nhiệm cho kết quả cuối cùng." _
        ), _
        Empty, _
        Empty, _
        "Giá trị của sinh viên trong thời đại AI là biết dùng AI để giải quyết bài toán thật." _
    )

    AddHumanLoopDiagram slide, 520, 148, 388, 150, "lime"
    AddCardGrid slide, cards, 520, 316, 388, 156, 3, "lime"
End Sub

Private Sub BuildSlide07(ByVal pres As Object)
    Dim cards As Variant

    cards = Array( _
        Array("", "Chuẩn hóa bài toán nhỏ", "Biến nhu cầu mơ hồ thành project có thể giao và đánh giá."), _
        Array("", "Kết nối theo năng lực", "Không chỉ hiển thị danh sách, mà gợi ý người phù hợp hơn."), _
        Array("", "Đo bằng đầu ra thật", "Giá trị thể hiện ở sản phẩm bàn giao và phản hồi thực tế."), _
        Array("", "Tích lũy hồ sơ thực chiến", "Sinh viên xây năng lực theo thời gian qua từng project đã làm.") _
    )

    AddMatrixSlide pres, 7, "yellow", "06", "Differentiation", _
        "Điểm khác biệt của Nho Ti", _
        "Khác biệt không nằm ở việc đăng thật nhiều job, mà ở cách biến bài toán nhỏ thành đầu ra thật và hồ sơ thực chiến.", _
        Empty, _
        Array("Brief rõ hơn", "Matching sát hơn", "Đầu ra thật", "Hồ sơ thực chiến"), _
        "Mỗi project tốt đều tạo thêm giá trị cho cả SME lẫn hồ sơ năng lực của sinh viên.", _
        Empty, _
        cards, _
        2
End Sub

Private Sub BuildSlide08(ByVal pres As Object)
    Dim slide As Object
    Dim stats As Variant
    Dim cards As Variant

    stats = Array( _
        Array("Stage", "Early MVP", "Bản mẫu ban đầu để kiểm chứng mô hình."), _
        Array("Người dùng thật", "Chưa có", "Chưa chạy thị trường rộng ở thời điểm hiện tại."), _
        Array("Mục tiêu", "Kiểm chứng", "Xác nhận giá trị trước khi nghĩ đến mở rộng.") _
    )

    cards = Array( _
        Array("H1", "SME có nhu cầu thật", "Có doanh nghiệp thật sự cần xử lý các việc số hóa nhỏ theo mô hình linh hoạt hơn."), _
        Array("H2", "Sinh viên muốn làm thật", "Có nhóm sinh viên sẵn sàng làm micro-project để tích lũy trải nghiệm thực chiến."), _
        Array("H3", "Matching tạo hợp tác", "Ghép nối giữa hai bên đủ tốt để tạo hợp tác thành công."), _
        Array("H4", "SME sẵn sàng trả phí", "Nếu giá trị đủ rõ, doanh nghiệp có động lực chi trả cho mô hình này.") _
    )

    Set slide = AddSplitSlide( _
        pres, 8, "orange", "07", "MVP", _
        "Hiện tại: early MVP đang kiểm chứng giá trị", _
        "Mục tiêu hiện tại không phải scale nhanh, mà là trả lời các giả thuyết sống còn của mô hình.", _
        Array( _
            "Sản phẩm chưa có người dùng thật và chưa sẵn sàng để mở rộng rộng rãi.", _
            "Điều quan trọng lúc này là kiểm chứng giá trị đủ thật hay chưa." _
        ), _
        Empty, _
        stats, _
        "Chưa có user thật không phải điểm yếu; đó là trạng thái trung thực để học đúng điều cốt lõi." _
    )

    AddCardGrid slide, cards, 520, 166, 388, 262, 2, "orange"
End Sub

Private Sub BuildSlide09(ByVal pres As Object)
    Dim slide As Object
    Dim cards As Variant

    cards = Array( _
        Array("Phía 1", "Doanh nghiệp SME", "Cần giải quyết đầu việc ngắn hạn, rõ ngân sách và muốn triển khai linh hoạt."), _
        Array("Phía 2", "Sinh viên", "Cần dự án thật, đầu ra thật và phản hồi thật để xây portfolio."), _
        Array("Monetization", "Doanh thu giai đoạn đầu", "Phí đăng project, ghép nối hoặc hỗ trợ quản lý project nhỏ cho SME.") _
    )

    Set slide = AddSplitSlide( _
        pres, 9, "cyan", "08", "Business model", _
        "Nền tảng hai phía, doanh thu bắt đầu từ SME", _
        "Sinh viên và SME cùng tạo nên giá trị nền tảng, nhưng phía trả phí hợp lý nhất trong giai đoạn đầu là SME.", _
        Array( _
            "SME nhận giá trị trực tiếp từ việc hoàn thành đầu việc.", _
            "Sinh viên là phía tích lũy năng lực và làm giàu nguồn cung chất lượng." _
        ), _
        Empty, _
        Empty, _
        "Bên trả phí đầu tiên: SME." _
    )

    AddMarketplaceDiagram slide, 520, 148, 388, 138, "cyan"
    AddCardGrid slide, cards, 520, 304, 388, 174, 2, "cyan"
End Sub

Private Sub BuildSlide10(ByVal pres As Object)
    Dim matrixItems As Variant

    matrixItems = Array( _
        Array("Sinh viên", "Nhận được gì?", Array( _
            "Dự án thật để rèn kỹ năng trong bối cảnh doanh nghiệp.", _
            "Portfolio có minh chứng, phản hồi và đầu ra rõ ràng.", _
            "Sự tự tin và khả năng tiến tới hợp tác dài hơn." _
        ), ""), _
        Array("SME", "Nhận được gì?", Array( _
            "Giải quyết đầu việc nhỏ nhanh hơn và phù hợp ngân sách hơn.", _
            "Tiếp cận nguồn nhân lực trẻ cho nhu cầu hiện tại và tương lai.", _
            "Cơ hội phát hiện cộng tác viên phù hợp từ project nhỏ." _
        ), "") _
    )

    AddMatrixSlide pres, 10, "violet", "09", "Value", _
        "Giá trị tạo ra cho cả hai bên", _
        "Mỗi project tốt không chỉ giải quyết một việc, mà còn tạo thêm dữ liệu năng lực và khả năng hợp tác lâu dài.", _
        Empty, _
        Empty, _
        "Giá trị nằm ở giao dịch hoàn thành và ở mối quan hệ, năng lực, dữ liệu được tích lũy sau đó.", _
        matrixItems, _
        Empty, _
        2
End Sub

Private Sub BuildSlide11(ByVal pres As Object)
    Dim roadmap As Variant

    roadmap = Array( _
        Array("01", "Micro-project platform", "Bắt đầu từ việc kết nối đầu việc nhỏ, ngắn hạn và có đầu ra rõ."), _
        Array("02", "Hồ sơ thực chiến", "Tích lũy dữ liệu năng lực thật của sinh viên qua từng project."), _
        Array("03", "Cầu nối nhân lực trẻ", "Giúp SME phát hiện và hợp tác tiếp với những bạn phù hợp."), _
        Array("04", "Hệ sinh thái học và làm", "Kết nối đào tạo, trải nghiệm thực tế và nhu cầu lao động trong thời đại AI.") _
    )

    AddRoadmapSlide pres, 11, "yellow", "10", "Vision + close", _
        "Tầm nhìn dài hạn + kết luận", _
        "Nếu mô hình được kiểm chứng, Nho Ti có thể đi từ micro-project platform thành hệ sinh thái học và làm; nhưng việc cần làm lúc này vẫn là kiểm chứng thật tốt giá trị cốt lõi.", _
        Array("Học tập", "Thực chiến", "Nghề nghiệp", "SME số hóa"), _
        "Bắt đầu từ việc nhỏ, đi tới giá trị thật", _
        Array( _
            "Vấn đề là thật: sinh viên cần cơ hội làm thật, SME cần giải pháp phù hợp cho việc thật.", _
            "Giải pháp là thực dụng: dùng AI để giảm ma sát trong mô hình hai phía.", _
            "Việc cần làm lúc này là kiểm chứng thật tốt trước khi mở rộng." _
        ), _
        "Vision ecosystem", _
        "Placeholder hệ sinh thái học tập, thực chiến, nghề nghiệp và SME được kết nối.", _
        roadmap
End Sub

Private Function AddHeroSlide( _
    ByVal pres As Object, _
    ByVal slideNumber As Long, _
    ByVal accentKey As String, _
    ByVal sectionLabel As String, _
    ByVal kicker As String, _
    ByVal title As String, _
    ByVal thesis As String, _
    ByVal statements As Variant, _
    ByVal bullets As Variant, _
    ByVal emphasis As String, _
    ByVal visualTitle As String, _
    ByVal visualCaption As String, _
    ByVal stats As Variant) As Object

    Dim slide As Object
    Dim nextTop As Single

    Set slide = CreateBaseSlide(pres, slideNumber, accentKey)

    AddBrandLockup slide, 42, 30
    nextTop = AddTitleBox(slide, sectionLabel, kicker, title, thesis, accentKey, 42, 74, 462, 39, 16)
    AddStatementChips slide, statements, 42, nextTop + 4, 462, accentKey
    AddBulletList slide, bullets, 42, nextTop + 40, 462, accentKey, 16
    AddEmphasisCard slide, emphasis, 42, 354, 462, 60, accentKey
    AddPlaceholderVisual slide, visualTitle, visualCaption, 548, 100, 328, 292, accentKey, "Placeholder ảnh"
    AddStatCards slide, stats, 42, 432, 836, 70, accentKey

    Set AddHeroSlide = slide
End Function

Private Function AddSplitSlide( _
    ByVal pres As Object, _
    ByVal slideNumber As Long, _
    ByVal accentKey As String, _
    ByVal sectionLabel As String, _
    ByVal kicker As String, _
    ByVal title As String, _
    ByVal thesis As String, _
    ByVal bullets As Variant, _
    ByVal statements As Variant, _
    ByVal stats As Variant, _
    ByVal emphasis As String) As Object

    Dim slide As Object
    Dim nextTop As Single

    Set slide = CreateBaseSlide(pres, slideNumber, accentKey)

    nextTop = AddTitleBox(slide, sectionLabel, kicker, title, thesis, accentKey, 42, 46, 430, 28, 14.5)

    If HasArrayItems(statements) Then
        AddStatementChips slide, statements, 42, nextTop, 430, accentKey
        nextTop = nextTop + 38
    End If

    If HasArrayItems(bullets) Then
        nextTop = AddBulletList(slide, bullets, 42, nextTop + 4, 430, accentKey, 14.25)
        nextTop = nextTop + 8
    End If

    If HasArrayItems(stats) Then
        AddStatCards slide, stats, 42, nextTop, 430, 76, accentKey
        nextTop = nextTop + 88
    End If

    AddEmphasisCard slide, emphasis, 42, nextTop, 430, 68, accentKey

    Set AddSplitSlide = slide
End Function

Private Function AddMatrixSlide( _
    ByVal pres As Object, _
    ByVal slideNumber As Long, _
    ByVal accentKey As String, _
    ByVal sectionLabel As String, _
    ByVal kicker As String, _
    ByVal title As String, _
    ByVal thesis As String, _
    ByVal bullets As Variant, _
    ByVal statements As Variant, _
    ByVal emphasis As String, _
    ByVal matrixItems As Variant, _
    ByVal cards As Variant, _
    ByVal cardColumns As Long) As Object

    Dim slide As Object
    Dim nextTop As Single

    Set slide = CreateBaseSlide(pres, slideNumber, accentKey)

    nextTop = AddTitleBox(slide, sectionLabel, kicker, title, thesis, accentKey, 42, 46, 876, 28, 14.5)

    If HasArrayItems(statements) Then
        AddStatementChips slide, statements, 42, nextTop, 876, accentKey
        nextTop = nextTop + 38
    End If

    If HasArrayItems(bullets) Then
        nextTop = AddBulletList(slide, bullets, 42, nextTop + 2, 876, accentKey, 14)
        nextTop = nextTop + 4
    End If

    If HasArrayItems(matrixItems) Then
        AddMatrixPanels slide, matrixItems, 42, nextTop + 6, 876, 214, accentKey
        nextTop = nextTop + 226
    End If

    If HasArrayItems(cards) Then
        AddCardGrid slide, cards, 42, nextTop + 6, 876, 214, cardColumns, accentKey
        nextTop = nextTop + 226
    End If

    AddEmphasisCard slide, emphasis, 42, nextTop + 4, 876, 54, accentKey

    Set AddMatrixSlide = slide
End Function

Private Function AddProcessSlide( _
    ByVal pres As Object, _
    ByVal slideNumber As Long, _
    ByVal accentKey As String, _
    ByVal sectionLabel As String, _
    ByVal kicker As String, _
    ByVal title As String, _
    ByVal thesis As String, _
    ByVal bullets As Variant, _
    ByVal steps As Variant, _
    ByVal stats As Variant, _
    ByVal visualTitle As String, _
    ByVal visualCaption As String) As Object

    Dim slide As Object
    Dim nextTop As Single

    Set slide = CreateBaseSlide(pres, slideNumber, accentKey)

    nextTop = AddTitleBox(slide, sectionLabel, kicker, title, thesis, accentKey, 42, 46, 438, 28, 14.5)
    nextTop = AddBulletList(slide, bullets, 42, nextTop + 6, 438, accentKey, 14.25)

    AddProcessFlow slide, steps, 42, 228, 438, 190, accentKey
    AddPlaceholderVisual slide, visualTitle, visualCaption, 522, 140, 396, 254, accentKey, "Mockup"
    AddStatCards slide, stats, 42, 432, 876, 70, accentKey

    Set AddProcessSlide = slide
End Function

Private Function AddRoadmapSlide( _
    ByVal pres As Object, _
    ByVal slideNumber As Long, _
    ByVal accentKey As String, _
    ByVal sectionLabel As String, _
    ByVal kicker As String, _
    ByVal title As String, _
    ByVal thesis As String, _
    ByVal statements As Variant, _
    ByVal conclusionTitle As String, _
    ByVal conclusionBullets As Variant, _
    ByVal visualTitle As String, _
    ByVal visualCaption As String, _
    ByVal roadmap As Variant) As Object

    Dim slide As Object
    Dim nextTop As Single
    Dim panel As Object

    Set slide = CreateBaseSlide(pres, slideNumber, accentKey)

    nextTop = AddTitleBox(slide, sectionLabel, kicker, title, thesis, accentKey, 42, 44, 876, 28, 14.5)
    AddStatementChips slide, statements, 42, nextTop, 876, accentKey

    Set panel = AddRoundedPanel(slide, 42, 204, 398, 132, CanvasColor(), InkColor(), 0, 1.8)
    panel.Fill.ForeColor.RGB = AccentColor(accentKey)
    panel.Fill.Transparency = 0.82
    SetShapeText panel, "", FONT_BODY, 12, InkColor()

    AddTextBox slide, 58, 220, 366, 20, conclusionTitle, FONT_HEADING, 16, InkColor(), True
    AddBulletList slide, conclusionBullets, 58, 246, 352, accentKey, 11.5

    AddPlaceholderVisual slide, visualTitle, visualCaption, 466, 204, 452, 132, accentKey, "Placeholder ảnh"
    AddRoadmapTimeline slide, roadmap, 42, 362, 876, 118, accentKey

    Set AddRoadmapSlide = slide
End Function

Private Function CreateBaseSlide(ByVal pres As Object, ByVal slideNumber As Long, ByVal accentKey As String) As Object
    Dim slide As Object
    Dim backgroundShape As Object
    Dim barShape As Object
    Dim glowShape As Object

    Set slide = pres.Slides.Add(pres.Slides.Count + 1, PP_LAYOUT_BLANK)

    Set backgroundShape = slide.Shapes.AddShape(SHAPE_RECTANGLE, 0, 0, PAGE_WIDTH, PAGE_HEIGHT)
    With backgroundShape
        .Fill.ForeColor.RGB = CanvasColor()
        .Line.ForeColor.RGB = InkColor()
        .Line.Weight = 2.25
    End With

    Set barShape = slide.Shapes.AddShape(SHAPE_RECTANGLE, 0, 0, PAGE_WIDTH, 10)
    With barShape
        .Fill.ForeColor.RGB = AccentColor(accentKey)
        .Line.Visible = MSO_FALSE
    End With

    Set glowShape = slide.Shapes.AddShape(SHAPE_OVAL, -38, -50, 170, 170)
    With glowShape
        .Fill.ForeColor.RGB = AccentColor(accentKey)
        .Fill.Transparency = 0.88
        .Line.Visible = MSO_FALSE
    End With

    Set glowShape = slide.Shapes.AddShape(SHAPE_OVAL, 802, 388, 190, 190)
    With glowShape
        .Fill.ForeColor.RGB = AccentColor(accentKey)
        .Fill.Transparency = 0.9
        .Line.Visible = MSO_FALSE
    End With

    AddSlideChrome slide, slideNumber, accentKey
    Set CreateBaseSlide = slide
End Function

Private Sub AddSlideChrome(ByVal slide As Object, ByVal slideNumber As Long, ByVal accentKey As String)
    Dim badge As Object

    Set badge = AddRoundedPanel(slide, 842, 22, 76, 32, AccentColor(accentKey), InkColor(), 0.76, 1.5)
    SetShapeText badge, Format$(slideNumber, "00") & " / 11", FONT_HEADING, 11, InkColor(), True, ALIGN_CENTER, ANCHOR_MIDDLE, 6, 6, 4, 4

    AddTextBox slide, 42, 508, 120, 14, "nhoti", FONT_HEADING, 10.5, MutedInkColor(), True
End Sub

Private Sub AddBrandLockup(ByVal slide As Object, ByVal leftPos As Single, ByVal topPos As Single)
    Dim cyanShape As Object
    Dim yellowShape As Object
    Dim badge As Object

    Set cyanShape = AddRoundedPanel(slide, leftPos, topPos + 12, 38, 38, RGB(125, 228, 255), InkColor(), 0, 2)
    cyanShape.Adjustments.Item(1) = 0.18

    Set yellowShape = AddRoundedPanel(slide, leftPos + 14, topPos, 38, 38, RGB(255, 229, 0), InkColor(), 0, 2)
    yellowShape.Adjustments.Item(1) = 0.18

    AddTextBox slide, leftPos + 62, topPos + 4, 120, 18, "Nho Ti", FONT_HEADING, 15.5, InkColor(), True

    Set badge = AddRoundedPanel(slide, leftPos + 62, topPos + 24, 144, 20, RGB(205, 243, 143), InkColor(), 0, 1.2)
    SetShapeText badge, "Nhỏ tí, giá trị thật", FONT_BODY, 9.5, InkColor(), True, ALIGN_CENTER, ANCHOR_MIDDLE, 6, 6, 2, 2
End Sub

Private Function AddTitleBox( _
    ByVal slide As Object, _
    ByVal sectionLabel As String, _
    ByVal kicker As String, _
    ByVal title As String, _
    ByVal thesis As String, _
    ByVal accentKey As String, _
    ByVal leftPos As Single, _
    ByVal topPos As Single, _
    ByVal boxWidth As Single, _
    ByVal titleSize As Single, _
    ByVal thesisSize As Single) As Single

    Dim titleHeight As Single
    Dim thesisTop As Single

    AddTextBox slide, leftPos, topPos, 72, 14, sectionLabel, FONT_HEADING, 10, MutedInkColor(), True
    AddLabelChip slide, kicker, leftPos + 76, topPos - 2, accentKey, EstimateChipWidth(kicker, 88)

    If titleSize >= 36 Then
        titleHeight = 92
        thesisTop = topPos + 86
    ElseIf titleSize >= 30 Then
        titleHeight = 78
        thesisTop = topPos + 72
    Else
        titleHeight = 66
        thesisTop = topPos + 62
    End If

    AddTextBox slide, leftPos, topPos + 22, boxWidth, titleHeight, title, FONT_HEADING, titleSize, InkColor(), True
    AddTextBox slide, leftPos, thesisTop, boxWidth, 54, thesis, FONTBodyName(), thesisSize, BodyColor(), False

    AddTitleBox = thesisTop + 58
End Function

Private Function AddBulletList( _
    ByVal slide As Object, _
    ByVal items As Variant, _
    ByVal leftPos As Single, _
    ByVal topPos As Single, _
    ByVal boxWidth As Single, _
    ByVal accentKey As String, _
    ByVal fontSize As Single) As Single

    Dim i As Long
    Dim currentTop As Single
    Dim lineHeight As Single
    Dim dotShape As Object

    If Not HasArrayItems(items) Then
        AddBulletList = topPos
        Exit Function
    End If

    lineHeight = fontSize + 18
    currentTop = topPos

    For i = LBound(items) To UBound(items)
        Set dotShape = slide.Shapes.AddShape(SHAPE_OVAL, leftPos, currentTop + 7, 10, 10)
        With dotShape
            .Fill.ForeColor.RGB = AccentColor(accentKey)
            .Line.ForeColor.RGB = InkColor()
            .Line.Weight = 1
        End With

        AddTextBox slide, leftPos + 18, currentTop, boxWidth - 18, lineHeight, CStr(items(i)), FONTBodyName(), fontSize, BodyColor(), False
        currentTop = currentTop + lineHeight
    Next i

    AddBulletList = currentTop
End Function

Private Sub AddStatCards( _
    ByVal slide As Object, _
    ByVal stats As Variant, _
    ByVal leftPos As Single, _
    ByVal topPos As Single, _
    ByVal boxWidth As Single, _
    ByVal boxHeight As Single, _
    ByVal accentKey As String)

    Dim i As Long
    Dim statCount As Long
    Dim gapSize As Single
    Dim cardWidth As Single
    Dim statCard As Variant

    If Not HasArrayItems(stats) Then Exit Sub

    statCount = ArrayLength(stats)
    gapSize = 10
    cardWidth = (boxWidth - (gapSize * (statCount - 1))) / statCount

    For i = LBound(stats) To UBound(stats)
        statCard = stats(i)
        AddStatCard slide, statCard, leftPos + ((i - LBound(stats)) * (cardWidth + gapSize)), topPos, cardWidth, boxHeight, accentKey
    Next i
End Sub

Private Sub AddStatCard( _
    ByVal slide As Object, _
    ByVal statCard As Variant, _
    ByVal leftPos As Single, _
    ByVal topPos As Single, _
    ByVal boxWidth As Single, _
    ByVal boxHeight As Single, _
    ByVal accentKey As String)

    Dim panel As Object

    Set panel = AddRoundedPanel(slide, leftPos, topPos, boxWidth, boxHeight, CanvasColor(), InkColor(), 0, 1.6)
    panel.Fill.ForeColor.RGB = AccentColor(accentKey)
    panel.Fill.Transparency = 0.84

    AddTextBox slide, leftPos + 12, topPos + 10, boxWidth - 24, 14, CStr(statCard(0)), FONT_HEADING, 9.5, MutedInkColor(), True
    AddTextBox slide, leftPos + 12, topPos + 24, boxWidth - 24, 24, CStr(statCard(1)), FONT_HEADING, 16, InkColor(), True
    AddTextBox slide, leftPos + 12, topPos + 46, boxWidth - 24, 18, CStr(statCard(2)), FONTBodyName(), 9.5, BodyColor(), False
End Sub

Private Sub AddPlaceholderVisual( _
    ByVal slide As Object, _
    ByVal title As String, _
    ByVal caption As String, _
    ByVal leftPos As Single, _
    ByVal topPos As Single, _
    ByVal boxWidth As Single, _
    ByVal boxHeight As Single, _
    ByVal accentKey As String, _
    ByVal badgeText As String)

    Dim panel As Object
    Dim zoneShape As Object
    Dim lineShape As Object
    Dim zoneTop As Single
    Dim zoneHeight As Single

    Set panel = AddRoundedPanel(slide, leftPos, topPos, boxWidth, boxHeight, CanvasColor(), InkColor(), 0, 1.8)
    AddLabelChip slide, badgeText, leftPos + 14, topPos + 10, accentKey, EstimateChipWidth(badgeText, 88)

    zoneTop = topPos + 40
    zoneHeight = boxHeight - 94

    Set zoneShape = AddRoundedPanel(slide, leftPos + 14, zoneTop, boxWidth - 28, zoneHeight, AccentColor(accentKey), InkColor(), 0.88, 1.2)
    zoneShape.Fill.ForeColor.RGB = AccentColor(accentKey)
    zoneShape.Fill.Transparency = 0.9

    Set lineShape = slide.Shapes.AddLine(leftPos + 28, zoneTop + 14, leftPos + boxWidth - 28, zoneTop + zoneHeight - 14)
    With lineShape.Line
        .ForeColor.RGB = AccentColor(accentKey)
        .Transparency = 0.35
        .Weight = 1.5
    End With

    Set lineShape = slide.Shapes.AddLine(leftPos + boxWidth - 28, zoneTop + 14, leftPos + 28, zoneTop + zoneHeight - 14)
    With lineShape.Line
        .ForeColor.RGB = AccentColor(accentKey)
        .Transparency = 0.35
        .Weight = 1.5
    End With

    AddTextBox slide, leftPos + 28, zoneTop + (zoneHeight / 2) - 10, boxWidth - 56, 20, "Visual / mockup / diagram", FONT_HEADING, 11.5, MutedInkColor(), True, ALIGN_CENTER
    AddTextBox slide, leftPos + 16, topPos + boxHeight - 42, boxWidth - 32, 16, title, FONT_HEADING, 12.5, InkColor(), True
    AddTextBox slide, leftPos + 16, topPos + boxHeight - 24, boxWidth - 32, 14, caption, FONTBodyName(), 9.5, BodyColor(), False
End Sub

Private Sub AddMarketplaceDiagram( _
    ByVal slide As Object, _
    ByVal leftPos As Single, _
    ByVal topPos As Single, _
    ByVal boxWidth As Single, _
    ByVal boxHeight As Single, _
    ByVal accentKey As String)

    Dim panel As Object
    Dim leftNode As Object
    Dim rightNode As Object
    Dim centerNode As Object
    Dim feeChip As Object

    Set panel = AddRoundedPanel(slide, leftPos, topPos, boxWidth, boxHeight, CanvasColor(), InkColor(), 0, 1.6)
    panel.Fill.ForeColor.RGB = AccentColor(accentKey)
    panel.Fill.Transparency = 0.92

    Set leftNode = AddRoundedPanel(slide, leftPos + 18, topPos + 28, 98, 58, AccentColor(accentKey), InkColor(), 0.84, 1.4)
    SetShapeText leftNode, "Sinh viên", FONT_HEADING, 14, InkColor(), True, ALIGN_CENTER, ANCHOR_MIDDLE

    Set centerNode = AddRoundedPanel(slide, leftPos + 144, topPos + 20, 112, 74, RGB(255, 229, 0), InkColor(), 0.62, 1.8)
    SetShapeText centerNode, "Nho Ti" & vbCrLf & "AI kết nối", FONT_HEADING, 13, InkColor(), True, ALIGN_CENTER, ANCHOR_MIDDLE

    Set rightNode = AddRoundedPanel(slide, leftPos + 286, topPos + 28, 84, 58, AccentColor(accentKey), InkColor(), 0.84, 1.4)
    SetShapeText rightNode, "SME", FONT_HEADING, 14, InkColor(), True, ALIGN_CENTER, ANCHOR_MIDDLE

    AddConnectorLine slide, leftPos + 116, topPos + 57, leftPos + 144, topPos + 57, accentKey
    AddConnectorLine slide, leftPos + 256, topPos + 57, leftPos + 286, topPos + 57, accentKey

    Set feeChip = AddRoundedPanel(slide, leftPos + 132, topPos + 102, 136, 20, RGB(205, 243, 143), InkColor(), 0, 1.2)
    SetShapeText feeChip, "Phí giai đoạn đầu: SME", FONTBodyName(), 9.75, InkColor(), True, ALIGN_CENTER, ANCHOR_MIDDLE, 6, 6, 2, 2
End Sub

Private Sub AddDualMeaningDiagram( _
    ByVal slide As Object, _
    ByVal leftPos As Single, _
    ByVal topPos As Single, _
    ByVal boxWidth As Single, _
    ByVal boxHeight As Single, _
    ByVal accentKey As String)

    Dim panel As Object
    Dim leftNode As Object
    Dim centerNode As Object
    Dim rightNode As Object

    Set panel = AddRoundedPanel(slide, leftPos, topPos, boxWidth, boxHeight, CanvasColor(), InkColor(), 0, 1.6)
    panel.Fill.ForeColor.RGB = AccentColor(accentKey)
    panel.Fill.Transparency = 0.94

    Set leftNode = slide.Shapes.AddShape(SHAPE_OVAL, leftPos + 18, topPos + 26, 94, 94)
    With leftNode
        .Fill.ForeColor.RGB = AccentColor(accentKey)
        .Fill.Transparency = 0.8
        .Line.ForeColor.RGB = InkColor()
        .Line.Weight = 1.4
    End With
    SetShapeText leftNode, "Nhỏ tí", FONT_HEADING, 15, InkColor(), True, ALIGN_CENTER, ANCHOR_MIDDLE

    Set centerNode = AddRoundedPanel(slide, leftPos + 144, topPos + 40, 104, 64, RGB(125, 228, 255), InkColor(), 0.65, 1.8)
    SetShapeText centerNode, "AI kết nối", FONT_HEADING, 13, InkColor(), True, ALIGN_CENTER, ANCHOR_MIDDLE

    Set rightNode = slide.Shapes.AddShape(SHAPE_OVAL, leftPos + 280, topPos + 26, 94, 94)
    With rightNode
        .Fill.ForeColor.RGB = AccentColor(accentKey)
        .Fill.Transparency = 0.8
        .Line.ForeColor.RGB = InkColor()
        .Line.Weight = 1.4
    End With
    SetShapeText rightNode, "Nhờ tí", FONT_HEADING, 15, InkColor(), True, ALIGN_CENTER, ANCHOR_MIDDLE

    AddConnectorLine slide, leftPos + 112, topPos + 74, leftPos + 144, topPos + 74, accentKey
    AddConnectorLine slide, leftPos + 248, topPos + 74, leftPos + 280, topPos + 74, accentKey

    AddTextBox slide, leftPos + 18, topPos + 118, 94, 18, "Sinh viên bắt đầu từ project nhỏ.", FONTBodyName(), 9.5, BodyColor(), False, ALIGN_CENTER
    AddTextBox slide, leftPos + 144, topPos + 112, 104, 24, "Làm rõ nhu cầu và ghép đúng người.", FONTBodyName(), 9.25, BodyColor(), False, ALIGN_CENTER
    AddTextBox slide, leftPos + 280, topPos + 118, 94, 18, "SME nhờ đúng người xử lý nhanh.", FONTBodyName(), 9.5, BodyColor(), False, ALIGN_CENTER
End Sub

Private Sub AddHumanLoopDiagram( _
    ByVal slide As Object, _
    ByVal leftPos As Single, _
    ByVal topPos As Single, _
    ByVal boxWidth As Single, _
    ByVal boxHeight As Single, _
    ByVal accentKey As String)

    Dim panel As Object
    Dim aiNode As Object
    Dim smeNode As Object
    Dim studentNode As Object
    Dim qualityNode As Object

    Set panel = AddRoundedPanel(slide, leftPos, topPos, boxWidth, boxHeight, CanvasColor(), InkColor(), 0, 1.6)
    panel.Fill.ForeColor.RGB = AccentColor(accentKey)
    panel.Fill.Transparency = 0.94

    Set aiNode = AddRoundedPanel(slide, leftPos + 134, topPos + 16, 120, 48, RGB(205, 243, 143), InkColor(), 0.58, 1.8)
    SetShapeText aiNode, "AI hỗ trợ", FONT_HEADING, 15, InkColor(), True, ALIGN_CENTER, ANCHOR_MIDDLE

    Set smeNode = AddRoundedPanel(slide, leftPos + 18, topPos + 82, 110, 42, AccentColor(accentKey), InkColor(), 0.82, 1.4)
    SetShapeText smeNode, "Bối cảnh SME", FONT_HEADING, 12.5, InkColor(), True, ALIGN_CENTER, ANCHOR_MIDDLE

    Set studentNode = AddRoundedPanel(slide, leftPos + 260, topPos + 82, 110, 42, AccentColor(accentKey), InkColor(), 0.82, 1.4)
    SetShapeText studentNode, "Sinh viên thực thi", FONT_HEADING, 11.5, InkColor(), True, ALIGN_CENTER, ANCHOR_MIDDLE

    Set qualityNode = AddRoundedPanel(slide, leftPos + 126, topPos + 96, 136, 28, RGB(125, 228, 255), InkColor(), 0.55, 1.4)
    SetShapeText qualityNode, "Phản hồi và chất lượng", FONTBodyName(), 10.5, InkColor(), True, ALIGN_CENTER, ANCHOR_MIDDLE, 6, 6, 2, 2

    AddConnectorLine slide, leftPos + 188, topPos + 64, leftPos + 74, topPos + 82, accentKey
    AddConnectorLine slide, leftPos + 188, topPos + 64, leftPos + 314, topPos + 82, accentKey
    AddConnectorLine slide, leftPos + 74, topPos + 124, leftPos + 126, topPos + 110, accentKey
    AddConnectorLine slide, leftPos + 370, topPos + 124, leftPos + 262, topPos + 110, accentKey
End Sub

Private Sub AddMatrixPanels( _
    ByVal slide As Object, _
    ByVal matrixItems As Variant, _
    ByVal leftPos As Single, _
    ByVal topPos As Single, _
    ByVal boxWidth As Single, _
    ByVal boxHeight As Single, _
    ByVal accentKey As String)

    Dim i As Long
    Dim columnCount As Long
    Dim gapSize As Single
    Dim cardWidth As Single

    columnCount = ArrayLength(matrixItems)
    If columnCount = 0 Then Exit Sub

    gapSize = 12
    cardWidth = (boxWidth - (gapSize * (columnCount - 1))) / columnCount

    For i = LBound(matrixItems) To UBound(matrixItems)
        AddMatrixPanel slide, matrixItems(i), leftPos + ((i - LBound(matrixItems)) * (cardWidth + gapSize)), topPos, cardWidth, boxHeight, accentKey
    Next i
End Sub

Private Sub AddMatrixPanel( _
    ByVal slide As Object, _
    ByVal itemData As Variant, _
    ByVal leftPos As Single, _
    ByVal topPos As Single, _
    ByVal boxWidth As Single, _
    ByVal boxHeight As Single, _
    ByVal accentKey As String)

    Dim panel As Object
    Dim itemList As Variant
    Dim itemTop As Single
    Dim i As Long

    Set panel = AddRoundedPanel(slide, leftPos, topPos, boxWidth, boxHeight, CanvasColor(), InkColor(), 0, 1.6)
    panel.Fill.ForeColor.RGB = AccentColor(accentKey)
    panel.Fill.Transparency = 0.9

    AddLabelChip slide, CStr(itemData(0)), leftPos + 12, topPos + 12, accentKey, EstimateChipWidth(CStr(itemData(0)), 72)
    AddTextBox slide, leftPos + 12, topPos + 40, boxWidth - 24, 22, CStr(itemData(1)), FONT_HEADING, 15.5, InkColor(), True

    itemList = itemData(2)
    itemTop = topPos + 70

    For i = LBound(itemList) To UBound(itemList)
        AddTextBox slide, leftPos + 16, itemTop, boxWidth - 32, 28, "• " & CStr(itemList(i)), FONTBodyName(), 10.5, BodyColor(), False
        itemTop = itemTop + 34
    Next i

    If UBound(itemData) >= 3 Then
        If Len(CStr(itemData(3))) > 0 Then
            AddLabelChip slide, CStr(itemData(3)), leftPos + 10, topPos + boxHeight - 30, accentKey, boxWidth - 20
        End If
    End If
End Sub

Private Sub AddCardGrid( _
    ByVal slide As Object, _
    ByVal cards As Variant, _
    ByVal leftPos As Single, _
    ByVal topPos As Single, _
    ByVal boxWidth As Single, _
    ByVal boxHeight As Single, _
    ByVal columns As Long, _
    ByVal accentKey As String)

    Dim cardCount As Long
    Dim rows As Long
    Dim gapSize As Single
    Dim cardWidth As Single
    Dim cardHeight As Single
    Dim i As Long
    Dim colIndex As Long
    Dim rowIndex As Long

    If Not HasArrayItems(cards) Then Exit Sub

    cardCount = ArrayLength(cards)
    If cardCount = 0 Then Exit Sub
    If columns < 1 Then columns = 1
    If columns > cardCount Then columns = cardCount

    rows = (cardCount + columns - 1) \ columns
    gapSize = 12
    cardWidth = (boxWidth - (gapSize * (columns - 1))) / columns
    cardHeight = (boxHeight - (gapSize * (rows - 1))) / rows

    For i = LBound(cards) To UBound(cards)
        colIndex = (i - LBound(cards)) Mod columns
        rowIndex = (i - LBound(cards)) \ columns

        AddInfoCard slide, cards(i), _
            leftPos + (colIndex * (cardWidth + gapSize)), _
            topPos + (rowIndex * (cardHeight + gapSize)), _
            cardWidth, _
            cardHeight, _
            accentKey
    Next i
End Sub

Private Sub AddInfoCard( _
    ByVal slide As Object, _
    ByVal cardData As Variant, _
    ByVal leftPos As Single, _
    ByVal topPos As Single, _
    ByVal boxWidth As Single, _
    ByVal boxHeight As Single, _
    ByVal accentKey As String)

    Dim panel As Object
    Dim labelValue As String
    Dim titleValue As String
    Dim bodyValue As String
    Dim titleTop As Single
    Dim titleSize As Single
    Dim bodySize As Single

    labelValue = CStr(cardData(0))
    titleValue = CStr(cardData(1))
    bodyValue = CStr(cardData(2))

    If boxWidth < 130 Then
        titleSize = 12.5
        bodySize = 9.5
    ElseIf boxWidth < 170 Then
        titleSize = 13.5
        bodySize = 10
    Else
        titleSize = 14.5
        bodySize = 10.75
    End If

    Set panel = AddRoundedPanel(slide, leftPos, topPos, boxWidth, boxHeight, CanvasColor(), InkColor(), 0, 1.5)
    panel.Fill.ForeColor.RGB = AccentColor(accentKey)
    panel.Fill.Transparency = 0.88

    titleTop = topPos + 18
    If Len(labelValue) > 0 Then
        AddLabelChip slide, labelValue, leftPos + 10, topPos + 10, accentKey, EstimateChipWidth(labelValue, 54)
        titleTop = topPos + 38
    End If

    AddTextBox slide, leftPos + 12, titleTop, boxWidth - 24, 26, titleValue, FONT_HEADING, titleSize, InkColor(), True
    AddTextBox slide, leftPos + 12, titleTop + 24, boxWidth - 24, boxHeight - 42, bodyValue, FONTBodyName(), bodySize, BodyColor(), False
End Sub

Private Sub AddProcessFlow( _
    ByVal slide As Object, _
    ByVal steps As Variant, _
    ByVal leftPos As Single, _
    ByVal topPos As Single, _
    ByVal boxWidth As Single, _
    ByVal boxHeight As Single, _
    ByVal accentKey As String)

    Dim stepCount As Long
    Dim columns As Long
    Dim rows As Long
    Dim gapSize As Single
    Dim stepWidth As Single
    Dim stepHeight As Single
    Dim i As Long
    Dim colIndex As Long
    Dim rowIndex As Long

    If Not HasArrayItems(steps) Then Exit Sub

    stepCount = ArrayLength(steps)
    columns = 2
    rows = (stepCount + columns - 1) \ columns
    gapSize = 12
    stepWidth = (boxWidth - gapSize) / columns
    stepHeight = (boxHeight - (gapSize * (rows - 1))) / rows

    For i = LBound(steps) To UBound(steps)
        colIndex = (i - LBound(steps)) Mod columns
        rowIndex = (i - LBound(steps)) \ columns

        AddStepCard slide, steps(i), i - LBound(steps) + 1, _
            leftPos + (colIndex * (stepWidth + gapSize)), _
            topPos + (rowIndex * (stepHeight + gapSize)), _
            stepWidth, _
            stepHeight, _
            accentKey
    Next i
End Sub

Private Sub AddStepCard( _
    ByVal slide As Object, _
    ByVal stepData As Variant, _
    ByVal stepNumber As Long, _
    ByVal leftPos As Single, _
    ByVal topPos As Single, _
    ByVal boxWidth As Single, _
    ByVal boxHeight As Single, _
    ByVal accentKey As String)

    Dim panel As Object
    Dim numberShape As Object

    Set panel = AddRoundedPanel(slide, leftPos, topPos, boxWidth, boxHeight, CanvasColor(), InkColor(), 0, 1.6)
    panel.Fill.ForeColor.RGB = AccentColor(accentKey)
    panel.Fill.Transparency = 0.9

    Set numberShape = slide.Shapes.AddShape(SHAPE_OVAL, leftPos + 10, topPos + 11, 28, 28)
    With numberShape
        .Fill.ForeColor.RGB = AccentColor(accentKey)
        .Fill.Transparency = 0.15
        .Line.ForeColor.RGB = InkColor()
        .Line.Weight = 1.2
    End With
    SetShapeText numberShape, Format$(stepNumber, "00"), FONT_HEADING, 11.5, InkColor(), True, ALIGN_CENTER, ANCHOR_MIDDLE, 4, 4, 2, 2

    AddTextBox slide, leftPos + 48, topPos + 10, boxWidth - 60, 20, CStr(stepData(0)), FONT_HEADING, 13.25, InkColor(), True
    AddTextBox slide, leftPos + 48, topPos + 30, boxWidth - 60, boxHeight - 34, CStr(stepData(1)), FONTBodyName(), 9.8, BodyColor(), False
End Sub

Private Sub AddRoadmapTimeline( _
    ByVal slide As Object, _
    ByVal roadmap As Variant, _
    ByVal leftPos As Single, _
    ByVal topPos As Single, _
    ByVal boxWidth As Single, _
    ByVal boxHeight As Single, _
    ByVal accentKey As String)

    Dim phaseCount As Long
    Dim gapSize As Single
    Dim cardWidth As Single
    Dim i As Long
    Dim lineShape As Object

    If Not HasArrayItems(roadmap) Then Exit Sub

    phaseCount = ArrayLength(roadmap)
    gapSize = 12
    cardWidth = (boxWidth - (gapSize * (phaseCount - 1))) / phaseCount

    Set lineShape = slide.Shapes.AddShape(SHAPE_RECTANGLE, leftPos + 24, topPos + 54, boxWidth - 48, 4)
    With lineShape
        .Fill.ForeColor.RGB = AccentColor(accentKey)
        .Fill.Transparency = 0.25
        .Line.Visible = MSO_FALSE
    End With

    For i = LBound(roadmap) To UBound(roadmap)
        AddRoadmapCard slide, roadmap(i), leftPos + ((i - LBound(roadmap)) * (cardWidth + gapSize)), topPos, cardWidth, boxHeight, accentKey
    Next i
End Sub

Private Sub AddRoadmapCard( _
    ByVal slide As Object, _
    ByVal phaseData As Variant, _
    ByVal leftPos As Single, _
    ByVal topPos As Single, _
    ByVal boxWidth As Single, _
    ByVal boxHeight As Single, _
    ByVal accentKey As String)

    Dim panel As Object

    Set panel = AddRoundedPanel(slide, leftPos, topPos, boxWidth, boxHeight, CanvasColor(), InkColor(), 0, 1.6)
    panel.Fill.ForeColor.RGB = AccentColor(accentKey)
    panel.Fill.Transparency = 0.9

    AddLabelChip slide, CStr(phaseData(0)), leftPos + 10, topPos + 10, accentKey, 40
    AddTextBox slide, leftPos + 12, topPos + 38, boxWidth - 24, 22, CStr(phaseData(1)), FONT_HEADING, 12.5, InkColor(), True
    AddTextBox slide, leftPos + 12, topPos + 60, boxWidth - 24, boxHeight - 68, CStr(phaseData(2)), FONTBodyName(), 9.5, BodyColor(), False
End Sub

Private Sub AddStatementChips( _
    ByVal slide As Object, _
    ByVal items As Variant, _
    ByVal leftPos As Single, _
    ByVal topPos As Single, _
    ByVal boxWidth As Single, _
    ByVal accentKey As String)

    Dim itemCount As Long
    Dim gapSize As Single
    Dim chipWidth As Single
    Dim i As Long
    Dim chip As Object

    If Not HasArrayItems(items) Then Exit Sub

    itemCount = ArrayLength(items)
    gapSize = 8
    chipWidth = (boxWidth - (gapSize * (itemCount - 1))) / itemCount

    For i = LBound(items) To UBound(items)
        Set chip = AddRoundedPanel(slide, leftPos + ((i - LBound(items)) * (chipWidth + gapSize)), topPos, chipWidth, 28, AccentColor(accentKey), InkColor(), 0.8, 1.2)
        SetShapeText chip, CStr(items(i)), FONTBodyName(), 10.5, InkColor(), True, ALIGN_CENTER, ANCHOR_MIDDLE, 8, 8, 3, 3
    Next i
End Sub

Private Sub AddEmphasisCard( _
    ByVal slide As Object, _
    ByVal textValue As String, _
    ByVal leftPos As Single, _
    ByVal topPos As Single, _
    ByVal boxWidth As Single, _
    ByVal boxHeight As Single, _
    ByVal accentKey As String)

    Dim panel As Object

    Set panel = AddRoundedPanel(slide, leftPos, topPos, boxWidth, boxHeight, AccentColor(accentKey), InkColor(), 0.76, 1.5)
    panel.Fill.ForeColor.RGB = AccentColor(accentKey)
    panel.Fill.Transparency = 0.78

    SetShapeText panel, textValue, FONTBodyName(), 12.5, InkColor(), True, ALIGN_LEFT, ANCHOR_MIDDLE, 14, 14, 8, 8
End Sub

Private Function AddLabelChip( _
    ByVal slide As Object, _
    ByVal textValue As String, _
    ByVal leftPos As Single, _
    ByVal topPos As Single, _
    ByVal accentKey As String, _
    ByVal chipWidth As Single) As Object

    Dim chip As Object

    Set chip = AddRoundedPanel(slide, leftPos, topPos, chipWidth, 20, AccentColor(accentKey), InkColor(), 0.72, 1.2)
    SetShapeText chip, textValue, FONTBodyName(), 9.25, InkColor(), True, ALIGN_CENTER, ANCHOR_MIDDLE, 6, 6, 2, 2
    Set AddLabelChip = chip
End Function

Private Function AddRoundedPanel( _
    ByVal slide As Object, _
    ByVal leftPos As Single, _
    ByVal topPos As Single, _
    ByVal boxWidth As Single, _
    ByVal boxHeight As Single, _
    ByVal fillColor As Long, _
    ByVal lineColor As Long, _
    ByVal transparencyValue As Single, _
    ByVal lineWeight As Single) As Object

    Dim panel As Object

    Set panel = slide.Shapes.AddShape(SHAPE_ROUNDED_RECTANGLE, leftPos, topPos, boxWidth, boxHeight)
    With panel
        .Fill.ForeColor.RGB = fillColor
        .Fill.Transparency = transparencyValue
        .Line.ForeColor.RGB = lineColor
        .Line.Weight = lineWeight
        .Adjustments.Item(1) = 0.12
    End With

    Set AddRoundedPanel = panel
End Function

Private Function AddTextBox( _
    ByVal slide As Object, _
    ByVal leftPos As Single, _
    ByVal topPos As Single, _
    ByVal boxWidth As Single, _
    ByVal boxHeight As Single, _
    ByVal textValue As String, _
    ByVal fontName As String, _
    ByVal fontSize As Single, _
    ByVal fontColor As Long, _
    ByVal isBold As Boolean, _
    Optional ByVal alignment As Long = ALIGN_LEFT) As Object

    Dim textShape As Object

    Set textShape = slide.Shapes.AddTextbox(TEXT_ORIENTATION_HORIZONTAL, leftPos, topPos, boxWidth, boxHeight)
    textShape.Fill.Visible = MSO_FALSE
    textShape.Line.Visible = MSO_FALSE

    SetShapeText textShape, textValue, fontName, fontSize, fontColor, isBold, alignment, ANCHOR_TOP, 0, 0, 0, 0
    Set AddTextBox = textShape
End Function

Private Sub SetShapeText( _
    ByVal target As Object, _
    ByVal textValue As String, _
    ByVal fontName As String, _
    ByVal fontSize As Single, _
    ByVal fontColor As Long, _
    Optional ByVal isBold As Boolean = False, _
    Optional ByVal alignment As Long = ALIGN_LEFT, _
    Optional ByVal verticalAnchor As Long = ANCHOR_TOP, _
    Optional ByVal marginLeft As Single = 10, _
    Optional ByVal marginRight As Single = 10, _
    Optional ByVal marginTop As Single = 6, _
    Optional ByVal marginBottom As Single = 6)

    With target.TextFrame
        .MarginLeft = marginLeft
        .MarginRight = marginRight
        .MarginTop = marginTop
        .MarginBottom = marginBottom
        .WordWrap = MSO_TRUE
        .VerticalAnchor = verticalAnchor
    End With

    With target.TextFrame2
        .WordWrap = MSO_TRUE
        .VerticalAnchor = verticalAnchor
        .AutoSize = AUTO_SIZE_FIT_TEXT
    End With

    With target.TextFrame.TextRange
        .Text = textValue
        .Font.Name = fontName
        .Font.Size = fontSize
        .Font.Color.RGB = fontColor
        If isBold Then
            .Font.Bold = MSO_TRUE
        Else
            .Font.Bold = MSO_FALSE
        End If
        .ParagraphFormat.Alignment = alignment
    End With
End Sub

Private Sub AddConnectorLine( _
    ByVal slide As Object, _
    ByVal x1 As Single, _
    ByVal y1 As Single, _
    ByVal x2 As Single, _
    ByVal y2 As Single, _
    ByVal accentKey As String)

    Dim lineShape As Object

    Set lineShape = slide.Shapes.AddLine(x1, y1, x2, y2)
    With lineShape.Line
        .ForeColor.RGB = AccentColor(accentKey)
        .Weight = 2.2
        .Transparency = 0.15
    End With
End Sub

Private Function HasArrayItems(ByVal candidate As Variant) As Boolean
    On Error GoTo CleanFail

    If IsEmpty(candidate) Then Exit Function
    If IsArray(candidate) Then
        HasArrayItems = (UBound(candidate) >= LBound(candidate))
    End If
    Exit Function

CleanFail:
    HasArrayItems = False
End Function

Private Function ArrayLength(ByVal candidate As Variant) As Long
    If Not HasArrayItems(candidate) Then
        ArrayLength = 0
    Else
        ArrayLength = UBound(candidate) - LBound(candidate) + 1
    End If
End Function

Private Function EstimateChipWidth(ByVal textValue As String, ByVal minimumWidth As Single) As Single
    Dim calculatedWidth As Single

    calculatedWidth = (Len(textValue) * 5.2) + 20
    If calculatedWidth < minimumWidth Then
        EstimateChipWidth = minimumWidth
    Else
        EstimateChipWidth = calculatedWidth
    End If
End Function

Private Function AccentColor(ByVal accentKey As String) As Long
    Select Case LCase$(accentKey)
        Case "violet"
            AccentColor = RGB(193, 177, 255)
        Case "cyan"
            AccentColor = RGB(125, 228, 255)
        Case "lime"
            AccentColor = RGB(205, 243, 143)
        Case "pink"
            AccentColor = RGB(252, 189, 214)
        Case "orange"
            AccentColor = RGB(255, 205, 153)
        Case Else
            AccentColor = RGB(255, 229, 0)
    End Select
End Function

Private Function CanvasColor() As Long
    CanvasColor = RGB(250, 248, 242)
End Function

Private Function InkColor() As Long
    InkColor = RGB(17, 17, 17)
End Function

Private Function MutedInkColor() As Long
    MutedInkColor = RGB(102, 102, 102)
End Function

Private Function BodyColor() As Long
    BodyColor = RGB(58, 58, 58)
End Function

Private Function FONTBodyName() As String
    If Len(FONT_BODY) > 0 Then
        FONTBodyName = FONT_BODY
    Else
        FONTBodyName = FONT_BODY_FALLBACK
    End If
End Function
