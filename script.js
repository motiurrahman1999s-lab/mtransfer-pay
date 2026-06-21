document.addEventListener('DOMContentLoaded', function() {
    // লাইভ টাইম
    function updateLiveTime() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        document.getElementById('liveTime').textContent = '🕐 ' + timeStr;
    }
    updateLiveTime();
    setInterval(updateLiveTime, 1000);

    // টাইমস্ট্যাম্প
    const now = new Date();
    document.getElementById('currentTime').textContent = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

    // ডিফল্ট অ্যামাউন্ট
    const amountInput = document.getElementById('amountInput');
    const defaultBtn = document.getElementById('setDefaultAmount');
    const DEFAULT_AMOUNT = 1890.00;

    defaultBtn.addEventListener('click', function() {
        amountInput.value = DEFAULT_AMOUNT.toFixed(2);
        amountInput.style.borderColor = '#ffd700';
        setTimeout(() => {
            amountInput.style.borderColor = 'rgba(255,255,255,0.15)';
        }, 500);
    });

    // ট্যাব সুইচিং
    const tabs = document.querySelectorAll('.tab');
    const bkashWallet = document.getElementById('bkash-wallet');
    const nagadWallet = document.getElementById('nagad-wallet');
    const paymentMethod = document.getElementById('payment_method');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const channel = this.dataset.channel;
            if (channel === 'bkash') {
                bkashWallet.style.display = 'block';
                nagadWallet.style.display = 'none';
                paymentMethod.value = 'bkash';
            } else {
                bkashWallet.style.display = 'none';
                nagadWallet.style.display = 'block';
                paymentMethod.value = 'nagad';
            }
        });
    });

    // কপি বাটন
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const text = document.getElementById(targetId).textContent.trim();
            navigator.clipboard.writeText(text).then(() => {
                const original = this.textContent;
                this.textContent = '✅ কপি!';
                this.classList.add('copied');
                setTimeout(() => {
                    this.textContent = original;
                    this.classList.remove('copied');
                }, 2000);
            }).catch(() => {
                alert('কপি ব্যর্থ! ম্যানুয়ালি কপি করুন: ' + text);
            });
        });
    });

    // ফর্ম সাবমিট
    const form = document.getElementById('payment-form');
    const resultMsg = document.getElementById('resultMessage');
    const submitBtn = document.getElementById('submitBtn');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const trxid = document.getElementById('trxid').value.trim();
        const method = document.getElementById('payment_method').value;
        const amount = parseFloat(amountInput.value) || 0;

        if (amount <= 0) {
            showMessage('⚠️ সঠিক টাকার পরিমাণ লিখুন!', 'error');
            return;
        }
        if (trxid.length < 5) {
            showMessage('⚠️ সঠিক TrxID লিখুন (কমপক্ষে ৫ অক্ষর)', 'error');
            return;
        }
        if (!/^[A-Za-z0-9]+$/.test(trxid)) {
            showMessage('⚠️ TrxID শুধু ইংরেজি অক্ষর ও সংখ্যা থাকতে পারে', 'error');
            return;
        }

        showMessage(
            `⏳ অনুগ্রহ করে কনফার্মেশনের জন্য অপেক্ষা করুন।<br>আপনার ট্রানজেকশন চেক করা হচ্ছে...<br><small style="opacity:0.7;">TrxID: ${trxid}</small>`,
            'pending'
        );

        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ প্রক্রিয়াধীন...';

        const pendingData = {
            trxid: trxid,
            amount: amount.toFixed(2),
            method: method,
            timestamp: new Date().toISOString()
        };

        let pendingList = JSON.parse(localStorage.getItem('pendingTransactions') || '[]');
        pendingList.push(pendingData);
        localStorage.setItem('pendingTransactions', JSON.stringify(pendingList));

        // অ্যাডমিন লিংক
        const adminLink = document.createElement('div');
        adminLink.style.cssText = `
            margin-top: 10px;
            padding: 10px;
            background: rgba(255,215,0,0.1);
            border-radius: 8px;
            text-align: center;
            font-size: 13px;
        `;
        adminLink.innerHTML = `
            📌 <strong>অ্যাডমিন</strong> (শুধুমাত্র আপনার জন্য):
            <a href="admin.html" target="_blank" style="color: #ffd700; text-decoration: underline;">
                এখানে কনফার্ম করুন
            </a>
        `;
        resultMsg.after(adminLink);

        setTimeout(() => {
            showMessage(
                `⏳ এখনও কনফার্ম হয়নি।<br>দয়া করে <strong>আপনার অ্যাপ</strong> চেক করুন এবং<br><strong>অ্যাডমিন প্যানেল</strong> এ গিয়ে কনফার্ম করুন।`,
                'pending'
            );
        }, 30000);
    });

    function showMessage(html, type) {
        resultMsg.style.display = 'block';
        resultMsg.className = type;
        resultMsg.innerHTML = html;
        if (type === 'error') {
            submitBtn.disabled = false;
            submitBtn.textContent = '✅ পেমেন্ট কনফার্ম করুন';
        }
    }
});