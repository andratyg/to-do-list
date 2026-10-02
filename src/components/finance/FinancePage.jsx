import React, { useState, useEffect } from "react";
import { useData } from "../../context/DataContext";
import { formatRupiah, getFormattedDate } from "../../utils/helpers";
import {
  ArrowLeft,
  Wallet,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Crown,
  Repeat,
  FileSpreadsheet,
  Trash2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Target,
  Sparkles,
  PieChart,
  History,
  CreditCard,
  Layers,
  ArrowRightLeft,
  Smartphone,
  Send,
  Lock,
  ShoppingBag,
  MoreVertical,
  Check,
  Edit2,
  X
} from "lucide-react";

const DEFAULT_KANTONGS = [
  { id: "cash", name: "Kantong Tunai", type: "spending", balance: 0, target: 0, color: "#4b5563", icon: "wallet" },
  { id: "dana", name: "Kantong DANA", type: "spending", balance: 0, target: 0, color: "#118ee9", icon: "credit-card" },
  { id: "ovo", name: "Kantong OVO", type: "spending", balance: 0, target: 0, color: "#4c3494", icon: "smartphone" },
  { id: "gopay", name: "Kantong GoPay", type: "spending", balance: 0, target: 0, color: "#00aa13", icon: "send" },
  { id: "kantong_nabung", name: "Tabungan Impian", type: "saving", balance: 0, target: 5000000, color: "#8b5cf6", icon: "target" },
  { id: "kantong_darurat", name: "Dana Darurat", type: "locked", balance: 0, target: 2000000, color: "#f59e0b", icon: "lock" }
];

const COLOR_PALETTE = [
  "#10b981", "#3b82f6", "#8b5cf6", "#ec4899",
  "#f59e0b", "#ef4444", "#14b8a6", "#4b5563"
];

export default function FinancePage({
  onBack,
  onOpenFinanceModal,
  onOpenGoldModal,
  onOpenSubModal,
  onExportExcel
}) {
  const {
    transactions,
    deleteTransaction,
    goldTransactions,
    settings,
    updateSetting,
    addTransaction
  } = useData();

  const [kantongs, setKantongs] = useState(() => {
    try {
      const local = localStorage.getItem("kantong_list_v1");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_KANTONGS;
  });

  const [selectedWallet, setSelectedWallet] = useState("cash");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");
  const [historyFilter, setHistoryFilter] = useState("all");
  
  // Transaction Form State
  const [formDesc, setFormDesc] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState("Jajan");

  // Modal States
  const [isKantongModalOpen, setIsKantongModalOpen] = useState(false);
  const [editingKantongId, setEditingKantongId] = useState(null);
  const [modalName, setModalName] = useState("");
  const [modalType, setModalType] = useState("spending");
  const [modalTarget, setModalTarget] = useState("");
  const [modalInitialBal, setModalInitialBal] = useState("");
  const [modalColor, setModalColor] = useState("#10b981");
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Transfer Modal State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferSource, setTransferSource] = useState("cash");
  const [transferDest, setTransferDest] = useState("kantong_nabung");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferNote, setTransferNote] = useState("");

  const hideBalance = settings?.hideBalance || false;

  const toggleHideBalance = () => {
    updateSetting("hideBalance", !hideBalance);
  };

  // Save kantongs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("kantong_list_v1", JSON.stringify(kantongs));
    } catch (e) {}
  }, [kantongs]);

  // Compute live pocket balances
  const pocketBalances = {};
  kantongs.forEach((k) => {
    pocketBalances[k.id] = Number(k.initialBalance || 0);
  });

  let totalMasuk = 0;
  let totalKeluar = 0;

  (transactions || []).forEach((t) => {
    const amt = Number(t.amount) || 0;
    let w = (t.wallet || "cash").toLowerCase();
    if (w === "kantong_utama") w = "cash";
    
    if (pocketBalances[w] === undefined) {
      pocketBalances[w] = 0;
    }

    if (t.type === "in") {
      totalMasuk += amt;
      pocketBalances[w] += amt;
    } else {
      totalKeluar += amt;
      pocketBalances[w] -= amt;
    }
  });

  const totalAssetKas = Object.values(pocketBalances).reduce((acc, val) => acc + val, 0);

  // Filtered Kantongs for display
  const displayedKantongs = kantongs.filter((k) => {
    if (activeCategoryFilter === "all") return true;
    return k.type === activeCategoryFilter;
  });

  // Filtered transactions
  const filteredTxns = (transactions || []).filter((t) => {
    if (historyFilter === "all") return true;
    return t.type === historyFilter;
  });

  // Handle direct inline add transaction
  const handleQuickAdd = (type) => {
    const amt = parseInt(formAmount, 10);
    if (!formDesc.trim()) {
      alert("Masukkan keterangan transaksi!");
      return;
    }
    if (isNaN(amt) || amt <= 0) {
      alert("Nominal uang harus lebih dari 0!");
      return;
    }

    addTransaction({
      desc: formDesc.trim(),
      amount: amt,
      type: type,
      category: formCategory,
      wallet: selectedWallet,
      date: new Date().toISOString()
    });

    setFormDesc("");
    setFormAmount("");
  };

  // Open Add Modal
  const openAddModal = () => {
    setEditingKantongId(null);
    setModalName("");
    setModalType("spending");
    setModalTarget("");
    setModalInitialBal("");
    setModalColor("#10b981");
    setIsKantongModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (k) => {
    setEditingKantongId(k.id);
    setModalName(k.name);
    setModalType(k.type || "spending");
    setModalTarget(k.target ? String(k.target) : "");
    setModalInitialBal(k.initialBalance ? String(k.initialBalance) : "");
    setModalColor(k.color || "#10b981");
    setIsKantongModalOpen(true);
    setActiveMenuId(null);
  };

  // Save Modal Data
  const handleSaveKantong = () => {
    if (!modalName.trim()) {
      alert("Masukkan nama kantong!");
      return;
    }

    const targetVal = Number(modalTarget) || 0;
    const initialBalVal = Number(modalInitialBal) || 0;

    if (editingKantongId) {
      // Edit existing
      setKantongs((prev) =>
        prev.map((k) =>
          k.id === editingKantongId
            ? {
                ...k,
                name: modalName.trim(),
                type: modalType,
                target: targetVal,
                initialBalance: initialBalVal,
                color: modalColor
              }
            : k
        )
      );
    } else {
      // Add new
      const newId = "k_" + Date.now();
      const newPocket = {
        id: newId,
        name: modalName.trim(),
        type: modalType,
        target: targetVal,
        initialBalance: initialBalVal,
        color: modalColor,
        icon: modalType === "saving" ? "target" : modalType === "locked" ? "lock" : "shopping-bag"
      };
      setKantongs((prev) => [...prev, newPocket]);
      setSelectedWallet(newId);
    }

    setIsKantongModalOpen(false);
  };

  // Delete Pocket
  const handleDeleteKantong = (id) => {
    if (["cash", "dana", "ovo", "gopay"].includes(id)) {
      alert("Kantong sistem utama tidak dapat dihapus!");
      return;
    }
    if (confirm("Hapus kantong ini? Riwayat transaksi tetap aman tersimpan.")) {
      setKantongs((prev) => prev.filter((k) => k.id !== id));
      if (selectedWallet === id) setSelectedWallet("cash");
      setIsKantongModalOpen(false);
      setActiveMenuId(null);
    }
  };

  // Execute Transfer between Kantongs
  const handleExecuteTransfer = () => {
    if (transferSource === transferDest) {
      alert("Kantong asal dan kantong tujuan tidak boleh sama!");
      return;
    }

    const amt = Number(transferAmount);
    if (!amt || amt <= 0) {
      alert("Masukkan nominal pindah dana yang valid!");
      return;
    }

    const currentSourceBal = pocketBalances[transferSource] || 0;
    if (amt > currentSourceBal) {
      alert("Saldo kantong asal tidak mencukupi!");
      return;
    }

    const sourceObj = kantongs.find((k) => k.id === transferSource);
    const destObj = kantongs.find((k) => k.id === transferDest);
    const sourceName = sourceObj ? sourceObj.name : transferSource;
    const destName = destObj ? destObj.name : transferDest;
    const noteText = transferNote.trim() ? ` (${transferNote.trim()})` : "";

    // 1. Transaction Out from Source
    addTransaction({
      desc: `Pindah ke ${destName}${noteText}`,
      amount: amt,
      type: "out",
      category: "Transfer",
      wallet: transferSource,
      date: new Date().toISOString()
    });

    // 2. Transaction In to Dest
    setTimeout(() => {
      addTransaction({
        desc: `Pindah dari ${sourceName}${noteText}`,
        amount: amt,
        type: "in",
        category: "Transfer",
        wallet: transferDest,
        date: new Date().toISOString()
      });
    }, 200);

    setIsTransferModalOpen(false);
    setTransferAmount("");
    setTransferNote("");
  };

  // Helper icon render
  const renderPocketIcon = (iconName, color) => {
    switch (iconName) {
      case "credit-card":
        return <CreditCard size={20} color={color} />;
      case "smartphone":
        return <Smartphone size={20} color={color} />;
      case "send":
        return <Send size={20} color={color} />;
      case "target":
        return <Target size={20} color={color} />;
      case "lock":
        return <Lock size={20} color={color} />;
      default:
        return <Wallet size={20} color={color} />;
    }
  };

  const getActiveWalletName = () => {
    const k = kantongs.find((p) => p.id === selectedWallet);
    return k ? k.name.toUpperCase() : selectedWallet.toUpperCase();
  };

  return (
    <div className="finance-page-view fade-in-up">
      {/* Topbar Navigation */}
      <div className="finance-page-header">
        <div className="finance-page-title-row">
          <button onClick={onBack} className="btn-back-dashboard" title="Kembali ke Dashboard">
            <ArrowLeft size={18} />
            <span>Kembali ke Dashboard</span>
          </button>
          <div className="finance-breadcrumbs">
            <span className="crumb-link" onClick={onBack}>Beranda</span>
            <span className="crumb-separator">/</span>
            <span className="crumb-current">Dompet & Keuangan</span>
          </div>
        </div>

        <div className="finance-header-quick-actions">
          <button onClick={() => setIsTransferModalOpen(true)} className="finance-action-chip">
            <ArrowRightLeft size={14} /> Pindah Dana
          </button>
          <button onClick={onOpenSubModal} className="finance-action-chip">
            <Repeat size={14} /> Langganan
          </button>
          <button onClick={onOpenGoldModal} className="finance-action-chip">
            <Crown size={14} color="#f59e0b" /> Tabungan Emas
          </button>
          <button onClick={onExportExcel} className="finance-action-chip">
            <FileSpreadsheet size={14} /> Ekspor Excel
          </button>
        </div>
      </div>

      {/* Hero Overview Banner */}
      <div className="finance-hero-banner">
        <div className="finance-hero-main">
          <div className="finance-hero-left">
            <div className="balance-badge">
              <Sparkles size={13} /> Akumulasi Saldo Kas Bersih
            </div>
            <div className="balance-title-row">
              <span className="balance-label">Total Aset Kas Aktif</span>
              <button
                onClick={toggleHideBalance}
                className="btn-eye-toggle"
                title={hideBalance ? "Lihat Saldo" : "Sembunyikan Saldo"}
              >
                {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <h1 className={`finance-main-balance ${hideBalance ? "balance-blur" : ""}`}>
              {hideBalance ? "Rp ••••••••" : formatRupiah(totalAssetKas)}
            </h1>
            <p className="balance-subtext">
              Terkonsolidasi real-time dari {kantongs.length} pos kantong digital kamu
            </p>
          </div>

          <div className="finance-hero-stats">
            <div className="finance-stat-card">
              <div className="stat-card-header">
                <div className="stat-icon-wrap icon-green">
                  <TrendingUp size={18} />
                </div>
                <div className="stat-title-wrap">
                  <span className="stat-title">Pemasukan Bulan Ini</span>
                  <b className={`stat-val text-green ${hideBalance ? "balance-blur" : ""}`}>
                    {hideBalance ? "Rp •••" : `+ ${formatRupiah(totalMasuk)}`}
                  </b>
                </div>
              </div>
              <small className="stat-footer-text">Total uang masuk tercatat</small>
            </div>

            <div className="finance-stat-card">
              <div className="stat-card-header">
                <div className="stat-icon-wrap icon-red">
                  <TrendingDown size={18} />
                </div>
                <div className="stat-title-wrap">
                  <span className="stat-title">Pengeluaran Bulan Ini</span>
                  <b className={`stat-val text-red ${hideBalance ? "balance-blur" : ""}`}>
                    {hideBalance ? "Rp •••" : `- ${formatRupiah(totalKeluar)}`}
                  </b>
                </div>
              </div>
              <small className="stat-footer-text">Total belanja & kebutuhan</small>
            </div>

            <div className="finance-stat-card">
              <div className="stat-card-header">
                <div className="stat-icon-wrap icon-purple">
                  <Target size={18} />
                </div>
                <div className="stat-title-wrap">
                  <span className="stat-title">Tabungan Emas</span>
                  <b className="stat-val">
                    {(goldTransactions || [])
                      .reduce(
                        (acc, tx) =>
                          tx.type === "buy"
                            ? acc + Number(tx.weight || 0)
                            : acc - Number(tx.weight || 0),
                        0
                      )
                      .toFixed(2)}{" "}
                    Gram
                  </b>
                </div>
              </div>
              <small className="stat-footer-text">Aset lindung nilai</small>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Kantong Keuangan (Digital Bank Pockets) Section */}
      <div className="kantong-header-section">
        <div className="kantong-title-area">
          <div className="title-with-icon">
            <div className="icon-box green">
              <Layers size={18} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: "1.25rem" }}>Kantong Keuangan</h3>
                <span className="kantong-badge-count">{kantongs.length} Kantong</span>
              </div>
              <p className="kantong-subtext">
                Pisahkan pos belanja, uang jajan, dan tabungan ala kantong bank digital
              </p>
            </div>
          </div>

          <div className="kantong-top-actions">
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="btn-kantong-action secondary"
              title="Pindah dana antar kantong"
            >
              <ArrowRightLeft size={15} /> Pindah Dana
            </button>
            <button
              onClick={openAddModal}
              className="btn-kantong-action primary"
              title="Tambah kantong baru"
            >
              <Plus size={15} /> Buat Kantong
            </button>
          </div>
        </div>

        {/* Filter Category Tabs */}
        <div className="kantong-filter-tabs">
          <button
            className={`kantong-tab ${activeCategoryFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveCategoryFilter("all")}
          >
            Semua ({kantongs.length})
          </button>
          <button
            className={`kantong-tab ${activeCategoryFilter === "spending" ? "active" : ""}`}
            onClick={() => setActiveCategoryFilter("spending")}
          >
            <ShoppingBag size={13} /> Bayar & Jajan (
            {kantongs.filter((k) => k.type === "spending").length})
          </button>
          <button
            className={`kantong-tab ${activeCategoryFilter === "saving" ? "active" : ""}`}
            onClick={() => setActiveCategoryFilter("saving")}
          >
            <Target size={13} /> Nabung & Impian (
            {kantongs.filter((k) => k.type === "saving").length})
          </button>
          <button
            className={`kantong-tab ${activeCategoryFilter === "locked" ? "active" : ""}`}
            onClick={() => setActiveCategoryFilter("locked")}
          >
            <Lock size={13} /> Terkunci / Darurat (
            {kantongs.filter((k) => k.type === "locked").length})
          </button>
        </div>
      </div>

      {/* Dynamic Kantong Cards Grid */}
      <div className="kantong-grid">
        {displayedKantongs.map((k) => {
          const bal = pocketBalances[k.id] || 0;
          const target = Number(k.target || 0);
          const percent = target > 0 ? Math.min(Math.round((bal / target) * 100), 100) : 0;
          const isSelected = selectedWallet === k.id;

          return (
            <div
              key={k.id}
              className={`kantong-card ${isSelected ? "active" : ""}`}
              onClick={() => setSelectedWallet(k.id)}
            >
              <div
                className="kantong-card-glow"
                style={{ background: k.color || "var(--primary)" }}
              />

              <div className="kantong-card-top">
                <div
                  className="kantong-icon-wrapper"
                  style={{
                    background: `${k.color || "#10b981"}20`,
                    color: k.color || "#10b981"
                  }}
                >
                  {renderPocketIcon(k.icon, k.color || "#10b981")}
                </div>

                <div className="kantong-top-meta">
                  <span
                    className={`kantong-type-chip ${
                      k.type === "saving"
                        ? "badge-saving"
                        : k.type === "locked"
                        ? "badge-locked"
                        : "badge-spending"
                    }`}
                  >
                    {k.type === "saving"
                      ? "Nabung"
                      : k.type === "locked"
                      ? "Darurat"
                      : "Bayar & Jajan"}
                  </span>

                  <div
                    className="kantong-menu-dropdown"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === k.id ? null : k.id);
                    }}
                  >
                    <button className="btn-kantong-menu" title="Menu Kantong">
                      <MoreVertical size={16} />
                    </button>

                    {activeMenuId === k.id && (
                      <div className="kantong-dropdown-popup">
                        <button
                          className="kmenu-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(k);
                          }}
                        >
                          <Edit2 size={13} /> Ubah Kantong
                        </button>
                        <button
                          className="kmenu-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTransferDest(k.id);
                            setIsTransferModalOpen(true);
                            setActiveMenuId(null);
                          }}
                        >
                          <ArrowRightLeft size={13} /> Pindah Saldo Ke Sini
                        </button>
                        {!["cash", "dana", "ovo", "gopay"].includes(k.id) && (
                          <button
                            className="kmenu-item danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteKantong(k.id);
                            }}
                          >
                            <Trash2 size={13} /> Hapus Kantong
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="kantong-name" title={k.name}>
                  {k.name}
                </div>
                <div className={`kantong-balance ${hideBalance ? "balance-blur" : ""}`}>
                  {hideBalance ? "Rp •••••••" : formatRupiah(bal)}
                </div>

                {k.type === "saving" && target > 0 && (
                  <div className="kantong-progress-area">
                    <div className="kantong-progress-labels">
                      <span>Target: {formatRupiah(target)}</span>
                      <b>{percent}%</b>
                    </div>
                    <div className="kantong-progress-bar">
                      <div
                        className="kantong-progress-fill"
                        style={{
                          width: `${percent}%`,
                          background: k.color || "var(--primary)"
                        }}
                      />
                    </div>
                    {percent >= 100 && (
                      <small className="target-achieved-text">🎉 Target Tercapai!</small>
                    )}
                  </div>
                )}
              </div>

              <div className="kantong-card-foot">
                <div className="kantong-select-indicator">
                  <div className="radio-circle" />
                  <span>{isSelected ? "Kantong Aktif" : "Pilih Kantong"}</span>
                </div>
                <button
                  className="btn-mini-transfer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTransferSource(k.id);
                    setIsTransferModalOpen(true);
                  }}
                  title="Pindah Saldo Dari Kantong Ini"
                >
                  <ArrowRightLeft size={11} /> Pindah
                </button>
              </div>
            </div>
          );
        })}

        {/* Add Kantong Dashed Card */}
        <div className="kantong-card-add" onClick={openAddModal}>
          <div className="add-icon-circle">
            <Plus size={24} />
          </div>
          <div className="add-text-title">Buat Kantong Baru</div>
          <div className="add-text-sub">Atur pos pengeluaran & tabungan baru</div>
        </div>
      </div>

      {/* 2-Column Content Grid: Form + Tips on Left, Transactions on Right */}
      <div className="finance-page-grid">
        {/* Left Column */}
        <div className="finance-col-form">
          <div className="card finance-card-modern">
            <div className="card-header">
              <div className="title-with-icon">
                <div className="icon-box green">
                  <Plus size={18} />
                </div>
                <h2>Catat Transaksi</h2>
              </div>
              <div className="wallet-active-badge">
                Dompet: <b>{getActiveWalletName()}</b>
              </div>
            </div>

            <div className="transaction-box">
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-sub)", display: "block", marginBottom: "4px" }}>
                  Sumber Kantong
                </label>
                <select
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value)}
                >
                  {kantongs.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name} (Saldo: {formatRupiah(pocketBalances[k.id] || 0)})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-sub)", display: "block", marginBottom: "4px" }}>
                  Keterangan Transaksi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Makan Siang, Beli Buku, Gaji..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              <div className="form-row" style={{ marginBottom: "16px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-sub)", display: "block", marginBottom: "4px" }}>
                    Nominal (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-sub)", display: "block", marginBottom: "4px" }}>
                    Kategori
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    <option value="Jajan">🍔 Jajan / Makan</option>
                    <option value="Transport">🚗 Transport / Bensin</option>
                    <option value="Belanja">🛍️ Belanja Bulanan</option>
                    <option value="Sedekah">🤝 Sedekah / Donasi</option>
                    <option value="Tagihan">⚡ Pulsa / Listrik</option>
                    <option value="Laundry">🧺 Laundry</option>
                    <option value="Skincare">💅 Skincare</option>
                    <option value="Nongkrong">☕ Nongkrong</option>
                    <option value="Kondangan">💌 Kado / Kondangan</option>
                    <option value="Parkir">🅿️ Parkir</option>
                    <option value="Hiburan">🎮 Game / Hiburan</option>
                    <option value="Cicilan">💸 Cicilan</option>
                    <option value="Tabungan">💰 Tabungan</option>
                    <option value="Lainnya">✨ Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="btn-group">
                <button className="btn-in" onClick={() => handleQuickAdd("in")}>
                  <TrendingUp size={16} /> Uang Masuk
                </button>
                <button className="btn-out" onClick={() => handleQuickAdd("out")}>
                  <TrendingDown size={16} /> Uang Keluar
                </button>
              </div>
            </div>
          </div>

          <div className="card finance-card-modern" style={{ marginTop: "20px" }}>
            <div className="card-header">
              <div className="title-with-icon">
                <div className="icon-box purple">
                  <Sparkles size={18} />
                </div>
                <h2>Tips Finansial Pintar</h2>
              </div>
            </div>
            <div className="finance-tips-content">
              <div className="tip-item">
                <span className="tip-number">1</span>
                <div>
                  <b>Aturan Alokasi 50/30/20</b>
                  <p>50% kebutuhan pokok, 30% hiburan & jajan, dan 20% langsung ke tabungan aman.</p>
                </div>
              </div>
              <div className="tip-item">
                <span className="tip-number">2</span>
                <div>
                  <b>Gunakan Fitur Pindah Dana</b>
                  <p>Sisihkan uang jajan langsung ke Kantong Tabungan setiap awal minggu agar hemat.</p>
                </div>
              </div>
              <div className="tip-item">
                <span className="tip-number">3</span>
                <div>
                  <b>Audit Langganan Rutin</b>
                  <p>Hentikan layanan streaming atau membership yang tidak aktif bulan ini.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Transactions History */}
        <div className="finance-col-analytics">
          <div className="card finance-card-modern history-section">
            <div className="history-header">
              <div className="title-with-icon">
                <div className="icon-box blue">
                  <History size={18} />
                </div>
                <h2>Riwayat Transaksi</h2>
              </div>
              <div className="history-controls">
                <select
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value)}
                >
                  <option value="all">Semua</option>
                  <option value="in">Masuk (+)</option>
                  <option value="out">Keluar (-)</option>
                </select>
                <button
                  className="btn-mini btn-export-history"
                  onClick={onExportExcel}
                  title="Unduh Excel"
                >
                  <FileSpreadsheet size={14} /> Ekspor
                </button>
              </div>
            </div>

            {filteredTxns.length === 0 ? (
              <div className="empty-state" style={{ padding: "40px 20px", textAlign: "center" }}>
                <Wallet size={36} style={{ opacity: 0.3, marginBottom: "10px" }} />
                <p style={{ color: "var(--text-sub)", fontSize: "0.9rem" }}>
                  Belum ada catatan transaksi pada filter ini.
                </p>
              </div>
            ) : (
              <ul className="history-list" style={{ maxHeight: "550px", overflowY: "auto" }}>
                {filteredTxns
                  .slice()
                  .reverse()
                  .map((t) => {
                    const pocket = kantongs.find((k) => k.id === (t.wallet || "cash"));
                    const pocketDisplayName = pocket ? pocket.name : (t.wallet || "TUNAI").toUpperCase();

                    return (
                      <li key={t.id} className="txn-item">
                        <div className="txn-left">
                          <b>{t.desc}</b>
                          <small>
                            {pocketDisplayName} • {t.category || "Umum"}
                          </small>
                        </div>
                        <div className="txn-right">
                          <b
                            style={{
                              color: t.type === "in" ? "var(--green)" : "var(--red)"
                            }}
                            className={hideBalance ? "balance-blur" : ""}
                          >
                            {t.type === "in" ? "+" : "-"} {formatRupiah(t.amount)}
                          </b>
                          <button
                            className="delete-txn-btn"
                            onClick={() => deleteTransaction(t.id)}
                            title="Hapus Transaksi"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Modal Buat / Edit Kantong */}
      {isKantongModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content fade-in-up" style={{ maxWidth: "460px" }}>
            <div className="modal-head">
              <h3>{editingKantongId ? "✏️ Ubah Kantong" : "✨ Buat Kantong Baru"}</h3>
              <button className="close-icon" onClick={() => setIsKantongModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "0.82rem", color: "var(--text-sub)", display: "block", marginBottom: "4px" }}>
                  Nama Kantong
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Nabung Laptop, Jajan Kopi..."
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  maxLength={30}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "0.82rem", color: "var(--text-sub)", display: "block", marginBottom: "6px" }}>
                  Tipe Kantong
                </label>
                <div className="kantong-type-selector">
                  <div
                    className={`kantong-type-option ${modalType === "spending" ? "active" : ""}`}
                    onClick={() => setModalType("spending")}
                  >
                    <ShoppingBag size={20} />
                    <div className="type-text">
                      <b>Bayar & Jajan</b>
                      <small>Pengeluaran harian</small>
                    </div>
                  </div>
                  <div
                    className={`kantong-type-option ${modalType === "saving" ? "active" : ""}`}
                    onClick={() => setModalType("saving")}
                  >
                    <Target size={20} />
                    <div className="type-text">
                      <b>Nabung & Target</b>
                      <small>Ada target nominal</small>
                    </div>
                  </div>
                  <div
                    className={`kantong-type-option ${modalType === "locked" ? "active" : ""}`}
                    onClick={() => setModalType("locked")}
                  >
                    <Lock size={20} />
                    <div className="type-text">
                      <b>Dana Darurat</b>
                      <small>Tersimpan aman</small>
                    </div>
                  </div>
                </div>
              </div>

              {modalType === "saving" && (
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ fontSize: "0.82rem", color: "var(--text-sub)", display: "block", marginBottom: "4px" }}>
                    Target Nominal Tabungan (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 5000000"
                    value={modalTarget}
                    onChange={(e) => setModalTarget(e.target.value)}
                  />
                </div>
              )}

              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "0.82rem", color: "var(--text-sub)", display: "block", marginBottom: "4px" }}>
                  Saldo Awal (Rp) <span style={{ opacity: 0.6 }}>(Opsional)</span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={modalInitialBal}
                  onChange={(e) => setModalInitialBal(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "0.82rem", color: "var(--text-sub)", display: "block", marginBottom: "6px" }}>
                  Pilih Warna Tema
                </label>
                <div className="kantong-color-picker">
                  {COLOR_PALETTE.map((c) => (
                    <div
                      key={c}
                      className={`color-pick-circle ${modalColor === c ? "active" : ""}`}
                      style={{ background: c }}
                      onClick={() => setModalColor(c)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-foot" style={{ display: "flex", justifyContent: "space-between" }}>
              {editingKantongId && !["cash", "dana", "ovo", "gopay"].includes(editingKantongId) ? (
                <button
                  className="btn-text-danger"
                  onClick={() => handleDeleteKantong(editingKantongId)}
                >
                  <Trash2 size={14} /> Hapus
                </button>
              ) : <div />}
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="btn-secondary-glass" onClick={() => setIsKantongModalOpen(false)}>
                  Batal
                </button>
                <button className="btn-primary" onClick={handleSaveKantong}>
                  Simpan Kantong
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pindah Dana Antar Kantong */}
      {isTransferModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content fade-in-up" style={{ maxWidth: "440px" }}>
            <div className="modal-head">
              <h3>💸 Pindah Dana Antar Kantong</h3>
              <button className="close-icon" onClick={() => setIsTransferModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "0.82rem", color: "var(--text-sub)", display: "block", marginBottom: "4px" }}>
                  Dari Kantong Asal
                </label>
                <select
                  value={transferSource}
                  onChange={(e) => setTransferSource(e.target.value)}
                >
                  {kantongs.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name} (Saldo: {formatRupiah(pocketBalances[k.id] || 0)})
                    </option>
                  ))}
                </select>
              </div>

              <div
                className="transfer-arrow-divider"
                onClick={() => {
                  const temp = transferSource;
                  setTransferSource(transferDest);
                  setTransferDest(temp);
                }}
                title="Tukar Asal dan Tujuan"
              >
                <ArrowRightLeft size={16} />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "0.82rem", color: "var(--text-sub)", display: "block", marginBottom: "4px" }}>
                  Ke Kantong Tujuan
                </label>
                <select
                  value={transferDest}
                  onChange={(e) => setTransferDest(e.target.value)}
                >
                  {kantongs.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name} (Saldo: {formatRupiah(pocketBalances[k.id] || 0)})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "0.82rem", color: "var(--text-sub)", display: "block", marginBottom: "4px" }}>
                  Nominal Pindah (Rp)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                />
              </div>

              <div className="quick-amount-pills" style={{ marginBottom: "14px" }}>
                <button
                  type="button"
                  className="amount-pill"
                  onClick={() => setTransferAmount(10000)}
                >
                  +10rb
                </button>
                <button
                  type="button"
                  className="amount-pill"
                  onClick={() => setTransferAmount(50000)}
                >
                  +50rb
                </button>
                <button
                  type="button"
                  className="amount-pill"
                  onClick={() => setTransferAmount(100000)}
                >
                  +100rb
                </button>
                <button
                  type="button"
                  className="amount-pill"
                  onClick={() => setTransferAmount(pocketBalances[transferSource] || 0)}
                >
                  Semua Saldo
                </button>
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", color: "var(--text-sub)", display: "block", marginBottom: "4px" }}>
                  Keterangan / Catatan <span style={{ opacity: 0.6 }}>(Opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Alokasi jajan minggu ini"
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-foot">
              <button
                className="btn-primary btn-block"
                onClick={handleExecuteTransfer}
              >
                Konfirmasi Pindah Dana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
