import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Image,
    Modal,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    Linking,
    RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { scale, verticalScale, moderateScale, fontSize } from '../utils/responsive';
import { Ionicons, MaterialCommunityIcons, Feather, Entypo } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import ScreenWrapper from '../components/ScreenWrapper';
import leadService from '../services/leadService';
import GlobalHeader from '../components/GlobalHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeCall, openWhatsApp, getContactNumberSync } from '../utils/contact';
import { useSubscription } from '../context/SubscriptionContext';
import SubscriptionGuard from '../components/SubscriptionGuard';

const { width } = Dimensions.get('window');

const STATUS_MAP = {
    'new': { label: 'New', color: '#7B61FF' },
    'not_answered': { label: 'Not Answered', color: '#F59E0B' },
    'interested': { label: 'Interested', color: '#10B981' },
    'not_interested': { label: 'Not Interested', color: '#EF4444' },
    'follow_up': { label: 'Follow-up', color: '#9F7AEA' },
    'appointment_booked': { label: 'Appointments Booked', color: '#7B61FF' },
    'closed': { label: 'Closed', color: '#64748B' },
};

const initialStats = Object.keys(STATUS_MAP).map(key => ({
    id: key,
    label: STATUS_MAP[key].label,
    color: STATUS_MAP[key].color,
    count: 0
}));

const DEMO_LEADS = [
    { id: 'd1', name: 'Rahul Sharma', phone: '987XXXXXX1', source: 'Meta Ads', status: 'new', createdAt: new Date().toISOString(), notesCount: 0 },
    { id: 'd2', name: 'Priya Patel', phone: '912XXXXXX2', source: 'Instagram', status: 'interested', createdAt: new Date(Date.now() - 86400000).toISOString(), notesCount: 1 },
    { id: 'd3', name: 'Ankit Verma', phone: '887XXXXXX3', source: 'Manual', status: 'follow_up', followUpDate: new Date(Date.now() + 172800000).toISOString(), createdAt: new Date(Date.now() - 172800000).toISOString(), notesCount: 2 },
    { id: 'd4', name: 'Suresh Kumar', phone: '776XXXXXX4', source: 'Facebook', status: 'appointment_booked', createdAt: new Date(Date.now() - 259200000).toISOString(), notesCount: 1 },
    { id: 'd5', name: 'Meena Iyer', phone: '998XXXXXX5', source: 'Meta Ads', status: 'closed', createdAt: new Date(Date.now() - 345600000).toISOString(), notesCount: 3 },
];

const DEMO_STATS = [
    { id: 'all', label: 'Total Leads', color: '#2D1E4E', count: 5 },
    { id: 'ratio', label: 'Conversion Ratio %', color: '#7B61FF', count: '20.0%', isRatio: true },
    { id: 'new', label: 'New', color: '#7B61FF', count: 1 },
    { id: 'not_answered', label: 'Not Answered', color: '#F59E0B', count: 0 },
    { id: 'interested', label: 'Interested', color: '#10B981', count: 1 },
    { id: 'not_interested', label: 'Not Interested', color: '#EF4444', count: 0 },
    { id: 'follow_up', label: 'Follow-up', color: '#9F7AEA', count: 1 },
    { id: 'appointment_booked', label: 'Appointments Booked', color: '#7B61FF', count: 1 },
    { id: 'closed', label: 'Closed', color: '#64748B', count: 1 },
];

const LeadsScreen = ({ navigation }) => {
    const searchInputRef = useRef(null);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('Daily');
    const [leads, setLeads] = useState([]);
    const [stats, setStats] = useState([
        { id: 'all', label: 'Total Leads', color: '#1E293B', count: 0 },
        ...initialStats
    ]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    const [pagination, setPagination] = useState({ totalPages: 1, totalLeads: 0 });
    const [selectedStatus, setSelectedStatus] = useState('all');

    // Modal States
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [customModalVisible, setCustomModalVisible] = useState(false);
    const [singlePickerVisible, setSinglePickerVisible] = useState(false);
    const [pickingFor, setPickingFor] = useState(''); // 'add' or 'edit'
    const [formErrors, setFormErrors] = useState({});

    const [newLead, setNewLead] = useState({
        name: '',
        phone: '',
        source: 'Manual Entry',
        status: 'new', // Using valid DB enum
        followUpDate: '',
    });

    const [activeLead, setActiveLead] = useState(null);
    const [leadHistory, setLeadHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [editForm, setEditForm] = useState({
        status: '',
        followUpDate: '',
        newNote: '',
    });

    const [customRange, setCustomRange] = useState({
        startDate: '', // YYYY-MM-DD
        endDate: '',   // YYYY-MM-DD
    });
    const [markedDates, setMarkedDates] = useState({});

    // Note Editing States
    const [noteEditModalVisible, setNoteEditModalVisible] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editingNoteText, setEditingNoteText] = useState('');

    const { isActive, checkSubscription } = useSubscription();

    // Force subscription refresh when screen comes into focus
    // This solves the issue of needing a logout after admin approval.
    useFocusEffect(
        useCallback(() => {
            checkSubscription();
        }, [])
    );

    const loadUser = async () => {
        try {
            const profileStr = await AsyncStorage.getItem('userProfile');
            if (profileStr) {
                setUser(JSON.parse(profileStr));
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    };

    const contactNumber = getContactNumberSync(user);
    const isPaid = isActive;

    const handleSupportCall = () => makeCall(contactNumber);
    const handleSupportWhatsApp = () => openWhatsApp(contactNumber, "Hi, I need help with managing my leads.");

    const clearFilters = () => {
        setSearch('');
        setActiveTab('Daily');
        setSelectedStatus('all');
        setCustomRange({ startDate: '', endDate: '' });
        setMarkedDates({});
        setPage(1);
    };

    const openSinglePicker = (target) => {
        setPickingFor(target);
        setSinglePickerVisible(true);
    };

    const handleSingleDateSelect = (day) => {
        if (pickingFor === 'add') {
            setNewLead({ ...newLead, followUpDate: day.dateString });
        } else {
            setEditForm({ ...editForm, followUpDate: day.dateString });
        }
        setSinglePickerVisible(false);
    };

    const formatDateShort = (dateStr) => {
        if (!dateStr) return '';
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const [y, m, d] = dateStr.split('-');
        return `${parseInt(d)} ${months[parseInt(m) - 1]}`;
    };

    const handleDayPress = (day) => {
        let { startDate, endDate } = customRange;

        if (!startDate || (startDate && endDate)) {
            // Start new selection
            startDate = day.dateString;
            endDate = '';
            setMarkedDates({
                [day.dateString]: { selected: true, startingDay: true, color: '#7B61FF', textColor: 'white' }
            });
            setCustomRange({ startDate, endDate });
        } else {
            // Complete range selection
            endDate = day.dateString;
            let start = new Date(startDate);
            let end = new Date(endDate);

            if (end < start) {
                [startDate, endDate] = [day.dateString, startDate];
                start = new Date(startDate);
                end = new Date(endDate);
            }

            const range = {};
            let current = new Date(start);

            while (current <= end) {
                const dateString = current.toISOString().split('T')[0];
                range[dateString] = {
                    selected: true,
                    color: '#7B61FF',
                    textColor: 'white',
                    startingDay: dateString === startDate,
                    endingDay: dateString === endDate
                };
                current.setDate(current.getDate() + 1);
            }

            setMarkedDates(range);
            setCustomRange({ startDate, endDate });
        }
    };

    const fetchLeads = async (pageNum = page) => {
        setLoading(true);
        try {
            const data = await leadService.listLeads({
                search,
                filter: activeTab,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
                startDate: customRange.startDate,
                endDate: customRange.endDate,
                page: pageNum,
                limit: 5
            });

            // If the server returns success, we are definitely paid
            setLeads(data.leads || []);
            if (data.pagination) {
                setPagination(data.pagination);
            }

            if (data.stats && Array.isArray(data.stats)) {
                let updatedStats = initialStats.map(stat => ({ ...stat, count: 0 }));
                let total = 0;
                data.stats.forEach(s => {
                    const idx = updatedStats.findIndex(us => us.id === s.status);
                    if (idx !== -1) {
                        const count = parseInt(s.count) || 0;
                        updatedStats[idx].count = count;
                        total += count;
                    }
                });

                const closedLeadCount = updatedStats.find(s => s.id === 'closed')?.count || 0;
                const closedRatio = total > 0 ? ((closedLeadCount / total) * 100).toFixed(1) : '0.0';

                const finalStats = [
                    { id: 'all', label: 'Total Leads', color: '#2D1E4E', count: total },
                    { id: 'ratio', label: 'Conversion Ratio %', color: '#7B61FF', count: `${closedRatio}%`, isRatio: true },
                    ...updatedStats
                ];
                setStats(finalStats);
            }
        } catch (error) {
            console.error('Fetch leads error:', error);
            // Fallback to demo data only if receiving a 403 (unpaid)
            if (error.response && error.response.status === 403) {
                setLeads(DEMO_LEADS);
                setStats(DEMO_STATS);
                setPagination({ totalPages: 1, totalLeads: 5 });
            }
        } finally {
            setLoading(false);
        }
    };

    // Automatically apply search filters with debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchLeads(1);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search, activeTab, customRange.startDate, customRange.endDate, selectedStatus, isPaid]);

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([loadUser(), fetchLeads(1)]);
        setRefreshing(false);
    };

    const applyCustomRange = () => {
        if (!customRange.startDate || !customRange.endDate) {
            Alert.alert('Required', 'Please enter both Start and End dates');
            return;
        }
        setCustomModalVisible(false);
        setActiveTab('Custom');
        setPage(1);
        fetchLeads(1);
    };

    const handleAddLead = async () => {
        const errors = {};
        if (!newLead.name?.trim()) errors.name = 'Name is required';

        const cleanPhone = newLead.phone?.replace(/[^\d]/g, '') || '';
        if (!newLead.phone?.trim()) {
            errors.phone = 'Phone number is required';
        } else if (cleanPhone.length !== 10) {
            errors.phone = 'Please enter a valid 10-digit number';
        }

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setSaving(true);
        try {
            const payload = { ...newLead };
            if (!payload.followUpDate || payload.followUpDate === '') {
                payload.followUpDate = null;
            }
            await leadService.createLead(payload);
            setAddModalVisible(false);
            setNewLead({ name: '', phone: '', source: 'Manual Entry', status: 'new' });
            setFormErrors({});
            fetchLeads(); // Refresh the list
        } catch (error) {
            console.error('Add lead error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to add lead');
        } finally {
            setSaving(false);
        }
    };

    const openEditLead = async (lead) => {
        if (!isPaid) {
            Alert.alert('Premium Feature', 'Upgrade to a paid plan to manage follow-up notes, update statuses, and track lead history.');
            return;
        }
        setActiveLead(lead);
        setEditForm({
            status: lead.status || 'new',
            followUpDate: lead.followUpDate || '',
            newNote: '',
        });
        setEditModalVisible(true);

        // Fetch history
        setHistoryLoading(true);
        try {
            const history = await leadService.getLeadNotes(lead.id);
            setLeadHistory(history || []);
        } catch (error) {
            console.error('Fetch history error:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleUpdateLead = async () => {
        if (!activeLead) return;
        setSaving(true);
        try {
            // Set to null if empty string or invalid is passed to avoid db validation error
            const fDate = (editForm.followUpDate && editForm.followUpDate !== '' && editForm.followUpDate !== 'Invalid date')
                ? editForm.followUpDate
                : null;

            // Logic for automatic system note if date changed
            const dateChanged = fDate !== activeLead.followUpDate;
            let noteToSubmit = editForm.newNote.trim();

            if (dateChanged && !noteToSubmit) {
                const formattedDate = fDate ? new Date(fDate).toLocaleDateString([], { day: 'numeric', month: 'short' }) : 'None';
                noteToSubmit = `Follow-up scheduled for ${formattedDate}`;
            }

            await leadService.updateLead(activeLead.id, {
                status: editForm.status,
                followUpDate: fDate
            });

            // If a note was entered (or auto-generated), add it
            if (noteToSubmit !== '') {
                await leadService.addLeadNote(activeLead.id, noteToSubmit);
            }

            setEditModalVisible(false);
            fetchLeads(); // Refresh list to get updated data
        } catch (error) {
            console.error('Update lead error:', error);
            Alert.alert('Error', 'Failed to update lead');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteLead = async () => {
        if (!activeLead) return;

        Alert.alert(
            'Delete Lead',
            `Are you sure you want to delete ${activeLead.name}? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setSaving(true);
                        try {
                            await leadService.deleteLead(activeLead.id);
                            setEditModalVisible(false);
                            fetchLeads();
                        } catch (error) {
                            console.error('Delete lead error:', error);
                            Alert.alert('Error', 'Failed to delete lead');
                        } finally {
                            setSaving(false);
                        }
                    }
                }
            ]
        );
    };

    const handleEditNote = (item) => {
        setEditingNoteId(item.id);
        setEditingNoteText(item.note);
        setNoteEditModalVisible(true);
    };

    const handleSaveNote = async () => {
        if (!editingNoteText.trim()) {
            Alert.alert('Required', 'Note content cannot be empty');
            return;
        }

        setSaving(true);
        try {
            await leadService.updateLeadNote(editingNoteId, editingNoteText);
            setNoteEditModalVisible(false);
            // Refresh history
            const history = await leadService.getLeadNotes(activeLead.id);
            setLeadHistory(history || []);
        } catch (error) {
            console.error('Update note error:', error);
            Alert.alert('Error', 'Failed to update note');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteNote = async (noteId) => {
        Alert.alert(
            'Delete Note',
            'Are you sure you want to delete this follow-up note?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setSaving(true);
                        try {
                            await leadService.deleteLeadNote(noteId);
                            // Refresh history
                            const history = await leadService.getLeadNotes(activeLead.id);
                            setLeadHistory(history || []);
                            fetchLeads(); // To update notes count
                        } catch (error) {
                            console.error('Delete note error:', error);
                            Alert.alert('Error', 'Failed to delete note');
                        } finally {
                            setSaving(false);
                        }
                    }
                }
            ]
        );
    };

    const handleCallLead = (phone) => {
        if (!isPaid) {
            Alert.alert('Premium Feature', 'Unlock call tracking and click-to-dial features by upgrading to a paid plan.');
            return;
        }
        if (!phone) {
            Alert.alert('Error', 'Phone number not available');
            return;
        }

        // Clean phone number (remove spaces, etc)
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        Linking.openURL(`tel:${cleanPhone}`).catch(err => {
            console.error('Linking error:', err);
            Alert.alert('Error', 'Unable to open dialer');
        });
    };

    const renderLeadCard = (lead) => {
        // Find color based on status
        const defaultStat = initialStats[0]; // New
        const statusConfig = STATUS_MAP[lead.status] || STATUS_MAP['new'];

        const initials = lead.name ? lead.name.substring(0, 2).toUpperCase() : 'LD';
        const color = statusConfig.color;
        const displayStatus = statusConfig.label;

        return (
            <View key={lead.id} style={styles.leadCard}>
                <View style={styles.leadHeader}>
                    <View style={[styles.initialsCircle, { backgroundColor: color + '20' }]}>
                        <Text style={[styles.initialsText, { color: color }]}>{initials}</Text>
                    </View>
                    <View style={styles.leadInfo}>
                        <View style={styles.leadNameRow}>
                            <Text style={styles.leadName} numberOfLines={1}>{lead.name}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
                                <Text style={[styles.statusText, { color: color }]}>{displayStatus}</Text>
                            </View>
                        </View>
                        <Text style={styles.leadPhone}>{lead.phone}</Text>
                    </View>
                    <View style={styles.leadActions}>
                        <TouchableOpacity
                            style={styles.actionIcon}
                            onPress={() => handleCallLead(lead.phone)}
                        >
                            <Feather name="phone" size={18} color="#7B61FF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionIcon}
                            onPress={() => openEditLead(lead)}
                        >
                            <Entypo name="dots-three-vertical" size={16} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.leadFooter}>
                    <View style={styles.sourceInfo}>
                        <Text style={styles.sourceLabel}>Source: <Text style={styles.sourceValue}>{lead.source || 'Manual' || 'Direct'}</Text></Text>
                        <Text style={styles.timeText}>{new Date(lead.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short' })}</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.leadStatsRow}
                        onPress={() => openEditLead(lead)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.statMiniBadge}>
                            <Feather name="message-square" size={12} color="#7B61FF" />
                            <Text style={styles.statMiniText}>{lead.notesCount || 0} {lead.notesCount == 1 ? 'Follow-up' : 'Follow-ups'}</Text>
                        </View>

                        {lead.followUpDate && (
                            <View style={[styles.statMiniBadge, { backgroundColor: '#FFFBEB', borderColor: '#FEF3C7' }]}>
                                <MaterialCommunityIcons name="calendar-clock" size={12} color="#D97706" />
                                <Text style={[styles.statMiniText, { color: '#D97706' }]}>Next: {new Date(lead.followUpDate).toLocaleDateString([], { day: 'numeric', month: 'short' })}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <ScreenWrapper bottomSafe={false}>
            <View style={styles.container}>
                <GlobalHeader
                    showSupport={false}
                    onNotificationPress={() => navigation.navigate('Notifications')}
                />

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7B61FF']} tintColor="#7B61FF" />
                    }
                >
                    {/* Top Row: Title & Action Icons */}
                    <View style={styles.topSection}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.pageTitle}>Leads</Text>
                            <TouchableOpacity
                                style={styles.paidUserRow}
                                onPress={() => !isPaid && navigation.navigate('Plans')}
                                disabled={isPaid}
                            >
                                <View style={[styles.paidBadge, !isPaid && { backgroundColor: '#FEE2E2' }]}>
                                    <Ionicons name={isPaid ? "checkmark-circle" : "close-circle"} size={12} color={isPaid ? "#10B981" : "#EF4444"} />
                                    <Text style={[styles.paidText, !isPaid && { color: '#B91C1C' }]}>{isPaid ? 'Paid User' : 'Free User'}</Text>
                                </View>
                                <Text style={styles.manageLeadsText}>
                                    {isPaid ? "Manage and track your leads" : "Upgrade to unlock full potential"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.topIcons}>
                            <TouchableOpacity
                                style={styles.headerIcon}
                                onPress={() => isActive ? searchInputRef.current?.focus() : Alert.alert('Premium feature', 'Upgrade to search your leads.')}
                            >
                                <Feather name="search" size={20} color={isActive ? "#64748B" : "#CBD5E1"} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.headerIcon, { backgroundColor: isActive ? '#7B61FF' : '#CBD5E1', borderColor: isActive ? '#7B61FF' : '#CBD5E1' }]}
                                onPress={() => isActive ? setAddModalVisible(true) : Alert.alert('Premium feature', 'Upgrade to add manual leads.')}
                            >
                                <Ionicons name="add" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Stats Horizontal Scroll */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer} contentContainerStyle={{ paddingRight: 20 }}>
                        {stats.map((stat, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.statCard,
                                    selectedStatus === stat.id && styles.activeStatCard,
                                    stat.isRatio && { opacity: 0.8 } // Ratio card often shouldn't be a filter, but let's see
                                ]}
                                onPress={() => {
                                    if (!stat.isRatio) {
                                        setSelectedStatus(stat.id);
                                        setPage(1); // Reset page on filter change
                                    }
                                }}
                                activeOpacity={stat.isRatio ? 1 : 0.7}
                            >
                                <View style={styles.statLabelRow}>
                                    <View style={[styles.statDot, { backgroundColor: stat.color }]} />
                                    <Text style={styles.statLabel}>{stat.label}</Text>
                                </View>
                                <Text style={styles.statCount}>{stat.count}</Text>
                                {selectedStatus === stat.id && !stat.isRatio && (
                                    <View style={[styles.activeStatIndicator, { backgroundColor: stat.color }]} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Search Bar */}
                    <View style={styles.searchBarContainer}>
                        <Feather name="search" size={18} color="#94A3B8" style={styles.searchIcon} />
                        <TextInput
                            ref={searchInputRef}
                            style={styles.searchInput}
                            placeholder="Search by name or phone number"
                            placeholderTextColor="#94A3B8"
                            value={search}
                            onChangeText={setSearch}
                            onFocus={() => {
                                if (!isPaid) {
                                    searchInputRef.current?.blur();
                                    Alert.alert('Premium Feature', 'Upgrade to a paid plan to search through your leads and apply advanced filters.');
                                }
                            }}
                        />
                    </View>

                    {/* Filter Section Header */}
                    <View style={styles.filterHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Ionicons name="filter" size={16} color="#64748B" />
                            <Text style={styles.filterHeaderTitle}>Filters</Text>
                        </View>
                        {(search !== '' || activeTab !== 'Daily' || customRange.startDate !== '') && (
                            <TouchableOpacity style={styles.clearBadge} onPress={clearFilters}>
                                <Text style={styles.clearBadgeText}>Reset Filters</Text>
                                <Ionicons name="refresh-circle" size={18} color="#EF4444" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Filter Tabs */}
                    <View style={styles.tabsContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingRight: 20 }}>
                            {['Daily', 'Weekly', 'Monthly'].map((tab) => (
                                <TouchableOpacity
                                    key={tab}
                                    style={[styles.tab, activeTab === tab && styles.activeTab]}
                                    onPress={() => setActiveTab(tab)}
                                >
                                    <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                style={[styles.tabCustom, (activeTab === 'Custom' || customRange.startDate !== '') && styles.activeTab]}
                                onPress={() => setCustomModalVisible(true)}
                            >
                                <Text style={[styles.tabText, (activeTab === 'Custom' || customRange.startDate !== '') && styles.activeTabText]}>
                                    {customRange.startDate ? `${formatDateShort(customRange.startDate)} - ${formatDateShort(customRange.endDate) || '...'}` : 'Custom Range'}
                                </Text>
                                <Feather name="chevron-down" size={16} color={(activeTab === 'Custom' || customRange.startDate !== '') ? '#7405CB' : '#64748B'} />
                            </TouchableOpacity>
                        </ScrollView>
                    </View>

                    {/* Leads List or Empty State */}
                    {loading ? (
                        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#7405CB" />
                        </View>
                    ) : (
                        <View>
                            {leads.length > 0 ? (
                                <View style={styles.leadsList}>
                                    {leads.map(renderLeadCard)}

                                    {/* Pagination Controls - Sleeker Design */}
                                    {pagination.totalPages > 1 && (
                                        <View style={styles.paginationWrapper}>
                                            <View style={styles.paginationLine} />
                                            <View style={styles.paginationControls}>
                                                <TouchableOpacity
                                                    style={[styles.miniPageBtn, page === 1 && styles.pageBtnDisabled]}
                                                    onPress={() => {
                                                        if (page > 1) {
                                                            const nextP = page - 1;
                                                            setPage(nextP);
                                                            fetchLeads(nextP);
                                                        }
                                                    }}
                                                    disabled={page === 1}
                                                >
                                                    <Feather name="arrow-left" size={18} color={page === 1 ? "#CBD5E1" : "#7405CB"} />
                                                </TouchableOpacity>

                                                <View style={styles.pageIndicatorBox}>
                                                    <Text style={styles.pageNumberText}>{page}</Text>
                                                    <Text style={styles.pageTotalText}> of {pagination.totalPages}</Text>
                                                </View>

                                                <TouchableOpacity
                                                    style={[styles.miniPageBtn, page === pagination.totalPages && styles.pageBtnDisabled]}
                                                    onPress={() => {
                                                        if (page < pagination.totalPages) {
                                                            const nextP = page + 1;
                                                            setPage(nextP);
                                                            fetchLeads(nextP);
                                                        }
                                                    }}
                                                    disabled={page === pagination.totalPages}
                                                >
                                                    <Feather name="arrow-right" size={18} color={page === pagination.totalPages ? "#CBD5E1" : "#7405CB"} />
                                                </TouchableOpacity>
                                            </View>
                                            <Text style={styles.resultCountText}>Showing {(page - 1) * 5 + 1}-{Math.min(page * 5, pagination.totalLeads)} of {pagination.totalLeads} Leads</Text>
                                        </View>
                                    )}
                                </View>
                            ) : (
                                <View style={styles.emptyStateContainer}>
                                    <View style={styles.emptyIllustrationBox}>
                                        <MaterialCommunityIcons name="clipboard-text-outline" size={70} color="#E9D5FF" />
                                        <View style={styles.emptyPlusBadge}>
                                            <Feather name="plus" size={16} color="#fff" />
                                        </View>
                                    </View>
                                    <Text style={styles.emptyStateTitle}>No Leads Yet</Text>
                                    <Text style={styles.emptyStateDesc}>
                                        You don't have any leads added yet.{'\n'}Start by adding your first lead to see them here.
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.emptyAddBtn}
                                        onPress={() => setAddModalVisible(true)}
                                    >
                                        <Feather name="plus" size={18} color="#fff" style={{ marginRight: 6 }} />
                                        <Text style={styles.emptyAddBtnText}>Add Your First Lead</Text>
                                    </TouchableOpacity>

                                </View>
                            )}
                        </View>
                    )}

                    {leads.length > 0 && (
                        <View style={styles.infoBanner}>
                            <View style={styles.infoIconBox}>
                                <Feather name="lock" size={20} color="#7B61FF" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoTitle}>Add, edit, track and manage your leads efficiently.</Text>
                                <Text style={styles.infoSubtitle}>Use filters and search to find leads quickly.</Text>
                            </View>
                            <TouchableOpacity style={styles.addLeadBtn} onPress={() => setAddModalVisible(true)}>
                                <Text style={styles.addLeadBtnText}>Add New Lead</Text>
                                <Feather name="plus" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Support Banner */}
                    <View style={styles.supportBanner}>
                        <View style={styles.supportLeft}>
                            <View style={styles.supportIconBox}>
                                <MaterialCommunityIcons name="headset" size={24} color="#10B981" />
                            </View>
                            <View>
                                <Text style={styles.supportTitle}>Need Help?</Text>
                                <Text style={styles.supportSubtitle}>Our support team is here to help you.</Text>
                            </View>
                        </View>
                        <View style={styles.supportActions}>
                            <TouchableOpacity style={styles.supportBtn} onPress={handleSupportWhatsApp}>
                                <MaterialCommunityIcons name="whatsapp" size={18} color="#10B981" />
                                <Text style={styles.supportBtnText}>WhatsApp</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.supportBtn} onPress={handleSupportCall}>
                                <Feather name="phone" size={18} color="#7B61FF" />
                                <Text style={styles.supportBtnText}>Call Us</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Bottom Status */}
                    <TouchableOpacity
                        style={styles.bottomStatus}
                        onPress={() => !isPaid && navigation.navigate('Plans')}
                        disabled={isPaid}
                    >
                        <Feather name={isPaid ? "unlock" : "lock"} size={14} color="#64748B" />
                        <Text style={styles.bottomStatusText}>
                            {isPaid ? "You are on Paid Plan. Enjoy full access to all features." : "You are on Free Plan. Upgrade for more features."}
                        </Text>
                    </TouchableOpacity>

                    <View style={{ height: 20 }} />
                </ScrollView>
            </View>

            {/* Add Lead Modal */}
            <Modal
                visible={addModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setAddModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add New Lead</Text>
                            <TouchableOpacity onPress={() => { setAddModalVisible(false); setFormErrors({}); }}>
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
                            <Text style={styles.inputLabel}>Lead Name *</Text>
                            <TextInput
                                style={[styles.input, formErrors.name && styles.inputError]}
                                value={newLead.name}
                                onChangeText={(text) => {
                                    setNewLead({ ...newLead, name: text });
                                    if (formErrors.name) setFormErrors({ ...formErrors, name: null });
                                }}
                                placeholder="Enter lead name"
                            />
                            {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}

                            <Text style={styles.inputLabel}>Phone Number *</Text>
                            <TextInput
                                style={[styles.input, formErrors.phone && styles.inputError]}
                                value={newLead.phone}
                                onChangeText={(text) => {
                                    const cleaned = text.replace(/[^\d]/g, '');
                                    if (cleaned.length <= 10) {
                                        setNewLead({ ...newLead, phone: cleaned });
                                        if (formErrors.phone) setFormErrors({ ...formErrors, phone: null });
                                    }
                                }}
                                placeholder="10-digit phone number"
                                keyboardType="number-pad"
                                maxLength={10}
                            />
                            {formErrors.phone && <Text style={styles.errorText}>{formErrors.phone}</Text>}

                            <Text style={styles.inputLabel}>Source</Text>
                            <TextInput
                                style={styles.input}
                                value={newLead.source}
                                onChangeText={(text) => setNewLead({ ...newLead, source: text })}
                                placeholder="E.g. Facebook Ads"
                            />

                            <Text style={styles.inputLabel}>Follow-up Date</Text>
                            <TouchableOpacity
                                style={styles.datePickerInput}
                                onPress={() => openSinglePicker('add')}
                            >
                                <Text style={[styles.datePickerValue, !newLead.followUpDate && { color: '#94A3B8' }]}>
                                    {newLead.followUpDate || 'Select Date'}
                                </Text>
                                <Feather name="calendar" size={18} color="#7405CB" />
                            </TouchableOpacity>

                            <Text style={styles.inputLabel}>Lead Status</Text>
                            <View style={styles.chipsRow}>
                                {Object.keys(STATUS_MAP).map(key => {
                                    const { label, color } = STATUS_MAP[key];
                                    const isSelected = newLead.status === key;
                                    return (
                                        <TouchableOpacity
                                            key={key}
                                            style={[
                                                styles.statusChip,
                                                isSelected && { backgroundColor: color, borderColor: color }
                                            ]}
                                            onPress={() => setNewLead({ ...newLead, status: key })}
                                        >
                                            <Text style={[
                                                styles.statusChipText,
                                                isSelected ? { color: '#fff' } : { color: '#64748B' }
                                            ]}>
                                                {label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <TouchableOpacity
                                style={[styles.saveButton, saving && { opacity: 0.7 }]}
                                onPress={handleAddLead}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Add Lead</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Edit Lead Status/Date Modal */}
            <Modal
                visible={editModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Update Lead</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>

                            <Text style={styles.inputLabel}>Lead Status</Text>
                            <View style={styles.chipsRow}>
                                {Object.keys(STATUS_MAP).map(key => {
                                    const { label, color } = STATUS_MAP[key];
                                    const isSelected = editForm.status === key;
                                    return (
                                        <TouchableOpacity
                                            key={key}
                                            style={[
                                                styles.statusChip,
                                                isSelected && { backgroundColor: color, borderColor: color }
                                            ]}
                                            onPress={() => setEditForm({ ...editForm, status: key })}
                                        >
                                            <Text style={[
                                                styles.statusChipText,
                                                isSelected ? { color: '#fff' } : { color: '#64748B' }
                                            ]}>
                                                {label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <Text style={styles.inputLabel}>Follow-up Date</Text>
                            <TouchableOpacity
                                style={styles.datePickerInput}
                                onPress={() => openSinglePicker('edit')}
                            >
                                <Text style={[styles.datePickerValue, !editForm.followUpDate && { color: '#94A3B8' }]}>
                                    {editForm.followUpDate || 'Select Date'}
                                </Text>
                                <Feather name="calendar" size={18} color="#7405CB" />
                            </TouchableOpacity>

                            <Text style={styles.inputLabel}>Add Follow-up Note</Text>
                            <TextInput
                                style={[styles.input, { height: 80, paddingTop: 12 }]}
                                value={editForm.newNote}
                                onChangeText={(text) => setEditForm({ ...editForm, newNote: text })}
                                placeholder="Type what you discussed with the lead..."
                                multiline={true}
                                textAlignVertical="top"
                            />
                            <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>
                                Adding a note increases the "Follow-up Count"
                            </Text>

                            {/* History Section */}
                            <Text style={[styles.inputLabel, { marginTop: 30 }]}>Follow-up History</Text>
                            <View style={styles.historyContainer}>
                                {historyLoading ? (
                                    <ActivityIndicator size="small" color="#7405CB" />
                                ) : leadHistory.length > 0 ? (
                                    leadHistory.map((item, idx) => (
                                        <View key={item.id} style={[styles.historyItem, idx === 0 && { borderLeftColor: '#7405CB' }]}>
                                            <View style={styles.historyDot} />
                                            <View style={styles.historyContent}>
                                                <View style={styles.historyHeader}>
                                                    <Text style={styles.historyNote}>{item.note}</Text>
                                                    <View style={styles.historyActions}>
                                                        <TouchableOpacity onPress={() => handleEditNote(item)}>
                                                            <Feather name="edit-2" size={14} color="#64748B" style={{ marginRight: 10 }} />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity onPress={() => handleDeleteNote(item.id)}>
                                                            <Feather name="trash-2" size={14} color="#EF4444" />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                                <Text style={styles.historyDate}>
                                                    {new Date(item.updatedAt || item.createdAt).getTime() > new Date(item.createdAt).getTime() + 1000 ? 'Updated: ' : ''}
                                                    {new Date(item.updatedAt || item.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </Text>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <View style={styles.emptyHistory}>
                                        <Feather name="clock" size={20} color="#CBD5E1" />
                                        <Text style={styles.emptyHistoryText}>No follow-up history yet.</Text>
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity
                                style={[styles.saveButton, saving && { opacity: 0.7 }]}
                                onPress={handleUpdateLead}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Update Status</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={handleDeleteLead}
                                disabled={saving}
                            >
                                <Feather name="trash-2" size={16} color="#EF4444" style={{ marginRight: 6 }} />
                                <Text style={styles.deleteButtonText}>Delete Lead</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Single Date Picker Modal */}
            <Modal
                visible={singlePickerVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setSinglePickerVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.datePickerModalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Follow-up Date</Text>
                            <TouchableOpacity onPress={() => setSinglePickerVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                        <Calendar
                            onDayPress={handleSingleDateSelect}
                            markedDates={{
                                [(pickingFor === 'add' ? newLead.followUpDate : editForm.followUpDate)]: {
                                    selected: true,
                                    selectedColor: '#7405CB'
                                }
                            }}
                            theme={{
                                todayTextColor: '#7405CB',
                                arrowColor: '#7405CB',
                                textMonthFontWeight: 'bold',
                            }}
                        />
                    </View>
                </View>
            </Modal>

            {/* Note Edit Modal */}
            <Modal
                visible={noteEditModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setNoteEditModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Follow-up Note</Text>
                            <TouchableOpacity onPress={() => setNoteEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={[styles.input, { height: 120, paddingTop: 12 }]}
                            value={editingNoteText}
                            onChangeText={setEditingNoteText}
                            placeholder="Update your follow-up note..."
                            multiline={true}
                            textAlignVertical="top"
                            autoFocus={true}
                        />

                        <TouchableOpacity
                            style={[styles.saveButton, saving && { opacity: 0.7 }]}
                            onPress={handleSaveNote}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Custom Range Picker Modal */}
            <Modal
                visible={customModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setCustomModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Select Date Range</Text>
                                <Text style={{ fontSize: 12, color: '#64748B' }}>Choose start and end date</Text>
                            </View>
                            <TouchableOpacity onPress={() => setCustomModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalScroll}>
                            <Calendar
                                onDayPress={handleDayPress}
                                markedDates={markedDates}
                                markingType={'period'}
                                theme={{
                                    selectedDayBackgroundColor: '#7405CB',
                                    todayTextColor: '#7405CB',
                                    arrowColor: '#7405CB',
                                    textMonthFontWeight: 'bold',
                                }}
                            />

                            <View style={styles.selectedDatesPreview}>
                                <View style={styles.dateInfoBox}>
                                    <Text style={styles.dateInfoLabel}>Start Date</Text>
                                    <Text style={styles.dateInfoValue}>{customRange.startDate || '--'}</Text>
                                </View>
                                <Ionicons name="arrow-forward" size={16} color="#94A3B8" />
                                <View style={styles.dateInfoBox}>
                                    <Text style={styles.dateInfoLabel}>End Date</Text>
                                    <Text style={styles.dateInfoValue}>{customRange.endDate || '--'}</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.saveButton, (!customRange.startDate || !customRange.endDate) && { opacity: 0.5 }]}
                                onPress={applyCustomRange}
                                disabled={!customRange.startDate || !customRange.endDate}
                            >
                                <Text style={styles.saveButtonText}>Apply Filter</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
};

// Mock missing Entypo
const Entypo = ({ name, size, color }) => (
    <MaterialCommunityIcons name={name === 'dots-three-vertical' ? 'dots-vertical' : name} size={size} color={color} />
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoBox: {
        width: 32,
        height: 32,
        backgroundColor: '#7405CB',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    logoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    logoSubtitle: {
        fontSize: 9,
        color: '#64748B',
        marginTop: -2,
    },
    content: {
        paddingHorizontal: 16,
    },
    topSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 15,
        alignItems: 'center',
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0D1B3E',
    },
    paidUserRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    paidBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        marginRight: 8,
    },
    paidText: {
        fontSize: fontSize(12),
        color: '#059669',
        fontWeight: 'bold',
        marginLeft: 4,
    },
    manageLeadsText: {
        fontSize: fontSize(13),
        color: '#64748B',
    },
    topIcons: {
        flexDirection: 'row',
        gap: 8,
    },
    headerIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    statsContainer: {
        marginBottom: 20,
    },
    statCard: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 14,
        minWidth: 100,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    statLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    statDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statLabel: {
        fontSize: fontSize(13),
        color: '#64748B',
        fontWeight: '600',
    },
    statCount: {
        fontSize: fontSize(20),
        fontWeight: 'bold',
        color: '#1E293B',
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        marginBottom: 16,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: fontSize(16),
        color: '#000000',
    },
    filterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
        paddingHorizontal: 4,
    },
    filterHeaderTitle: {
        fontSize: fontSize(16),
        fontWeight: 'bold',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    clearBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    clearBadgeText: {
        fontSize: fontSize(11),
        fontWeight: 'bold',
        color: '#EF4444',
    },
    tabsContainer: {
        marginBottom: 20,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    activeTab: {
        backgroundColor: '#F4E8FC',
        borderColor: '#7405CB',
    },
    tabText: {
        fontSize: fontSize(14),
        color: '#64748B',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#7405CB',
    },
    tabCustom: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    leadsList: {
        gap: 12,
        marginBottom: 24,
    },
    leadCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 5,
        elevation: 2,
    },
    leadHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    initialsCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    initialsText: {
        fontSize: fontSize(14),
        fontWeight: 'bold',
    },
    leadInfo: {
        flex: 1,
    },
    leadNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
        flexWrap: 'wrap',
        gap: 4,
    },
    leadName: {
        fontSize: fontSize(18),
        fontWeight: 'bold',
        color: '#1E293B',
        marginRight: 4,
        flexShrink: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    statusText: {
        fontSize: fontSize(12),
        fontWeight: 'bold',
    },
    leadPhone: {
        fontSize: fontSize(15),
        color: '#64748B',
    },
    leadActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionIcon: {
        width: 34,
        height: 34,
        borderRadius: 8,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    leadFooter: {
        paddingTop: 12,
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        gap: 10,
    },
    sourceInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leadStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statMiniBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#F5F3FF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#EDE9FE',
    },
    statMiniText: {
        fontSize: fontSize(12),
        fontWeight: 'bold',
        color: '#6366F1',
    },
    sourceLabel: {
        fontSize: fontSize(13),
        color: '#64748B',
    },
    sourceValue: {
        color: '#64748B',
        fontWeight: '500',
    },
    timeText: {
        fontSize: fontSize(13),
        color: '#94A3B8',
    },
    followUpRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    followUpText: {
        fontSize: fontSize(11),
        color: '#F59E0B',
        fontWeight: '600',
    },
    infoBanner: {
        backgroundColor: '#F4E8FC',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    infoIconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: fontSize(12),
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 2,
    },
    infoSubtitle: {
        fontSize: fontSize(11),
        color: '#64748B',
    },
    addLeadBtn: {
        backgroundColor: '#7405CB',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 4,
    },
    addLeadBtnText: {
        fontSize: fontSize(12),
        fontWeight: 'bold',
        color: '#fff',
    },
    supportBanner: {
        backgroundColor: '#F0FDF4',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    supportLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    supportIconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    supportTitle: {
        fontSize: fontSize(16),
        fontWeight: 'bold',
        color: '#1E293B',
    },
    supportSubtitle: {
        fontSize: fontSize(13),
        color: '#64748B',
    },
    supportActions: {
        flexDirection: 'row',
        gap: 12,
    },
    supportBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 8,
        borderRadius: 10,
        gap: 8,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    supportBtnText: {
        fontSize: fontSize(12),
        fontWeight: 'bold',
        color: '#1E293B',
    },
    bottomStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 20,
    },
    bottomStatusText: {
        fontSize: fontSize(13),
        color: '#64748B',
        fontWeight: '500',
    },
    // Empty State Styles
    emptyStateContainer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    emptyIllustrationBox: {
        width: 100,
        height: 100,
        backgroundColor: '#F4E8FC',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    emptyPlusBadge: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: '#7405CB',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    emptyStateTitle: {
        fontSize: fontSize(22),
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 8,
    },
    emptyStateDesc: {
        textAlign: 'center',
        fontSize: fontSize(13),
        color: '#64748B',
        lineHeight: fontSize(20),
        marginBottom: verticalScale(24),
        paddingHorizontal: scale(20),
    },
    emptyAddBtn: {
        flexDirection: 'row',
        backgroundColor: '#7405CB',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 30,
    },
    emptyAddBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: fontSize(14),
    },
    featureCardsRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        paddingHorizontal: 0,
    },
    featureCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    featureIconBadge: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    featureTitle: {
        fontSize: fontSize(13),
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 6,
    },
    featureDesc: {
        fontSize: fontSize(11),
        color: '#64748B',
        lineHeight: 16,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: fontSize(20),
        fontWeight: 'bold',
        color: '#1E293B',
    },
    modalScroll: {
        paddingBottom: 40,
    },
    inputLabel: {
        fontSize: fontSize(14),
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
        marginTop: verticalScale(12),
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(14),
        fontSize: fontSize(15),
        color: '#1E293B',
    },
    inputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    errorText: {
        color: '#EF4444',
        fontSize: fontSize(12),
        marginTop: 4,
        marginLeft: 4,
    },
    saveButton: {
        backgroundColor: '#7B61FF',
        borderRadius: 12,
        paddingVertical: verticalScale(16),
        alignItems: 'center',
        marginTop: verticalScale(30),
        marginBottom: verticalScale(10),
    },
    saveButtonText: {
        color: '#fff',
        fontSize: fontSize(16),
        fontWeight: 'bold',
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
    },
    statusChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
    },
    statusChipText: {
        fontSize: fontSize(13),
        fontWeight: '600',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    deleteButtonText: {
        color: '#EF4444',
        fontSize: fontSize(14),
        fontWeight: 'bold',
    },
    clearFilterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FEE2E2',
        gap: 6,
    },
    clearIconBg: {
        width: 22,
        height: 22,
        backgroundColor: '#fff',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearFilterText: {
        fontSize: fontSize(12),
        fontWeight: 'bold',
        color: '#EF4444',
    },
    selectedDatesPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        padding: 15,
        borderRadius: 12,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    dateInfoBox: {
        flex: 1,
        alignItems: 'center',
    },
    dateInfoLabel: {
        fontSize: 10,
        color: '#64748B',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginBottom: 2,
    },
    dateInfoValue: {
        fontSize: fontSize(14),
        fontWeight: 'bold',
        color: '#1E293B',
    },
    datePickerInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginTop: 4,
    },
    datePickerValue: {
        fontSize: fontSize(15),
        color: '#1E293B',
    },
    datePickerModalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        width: '90%',
        alignSelf: 'center',
        marginBottom: 'auto',
        marginTop: 'auto',
    },
    // History Styles
    historyContainer: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 16,
        marginTop: 10,
        minHeight: 100,
    },
    historyItem: {
        borderLeftWidth: 2,
        borderLeftColor: '#E2E8F0',
        paddingLeft: 16,
        paddingBottom: 20,
        position: 'relative',
    },
    historyDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#CBD5E1',
        position: 'absolute',
        left: -6,
        top: 2,
        borderWidth: 2,
        borderColor: '#F8FAFC',
    },
    historyContent: {
        marginTop: -2,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    historyActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    historyNote: {
        fontSize: fontSize(13),
        color: '#1E293B',
        lineHeight: fontSize(18),
        fontWeight: '500',
    },
    historyDate: {
        fontSize: 10,
        color: '#64748B',
        marginTop: 4,
    },
    emptyHistory: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        gap: 8,
    },
    emptyHistoryText: {
        fontSize: fontSize(12),
        color: '#64748B',
    },
    paginationWrapper: {
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 40,
    },
    paginationLine: {
        width: '40%',
        height: 1,
        backgroundColor: '#F1F5F9',
        marginBottom: 20,
    },
    paginationControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    miniPageBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    pageIndicatorBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pageNumberText: {
        fontSize: fontSize(16),
        fontWeight: 'bold',
        color: '#7405CB',
    },
    pageTotalText: {
        fontSize: fontSize(15),
        color: '#64748B',
        fontWeight: '500',
    },
    resultCountText: {
        marginTop: 12,
        fontSize: fontSize(11),
        color: '#94A3B8',
        fontWeight: '500',
    },
    activeStatCard: {
        borderColor: '#7B61FF',
        backgroundColor: '#F5F3FF',
        shadowColor: '#7B61FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    activeStatIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 12,
        right: 12,
        height: 2,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
    },
});

export default LeadsScreen;
